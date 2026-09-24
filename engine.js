// MileMinder engine - car maintenance intervals by km and time (no DOM)
(function (root) {
  'use strict';

  var ITEMS = [
    { id: 'oil',        label: 'Engine oil & filter', km: 10000, months: 6 },
    { id: 'rotation',   label: 'Tire rotation',       km: 10000, months: 6 },
    { id: 'airfilter',  label: 'Engine air filter',   km: 20000, months: 12 },
    { id: 'cabinfilt',  label: 'Cabin air filter',    km: 15000, months: 12 },
    { id: 'brakefluid', label: 'Brake fluid',         km: 40000, months: 24 },
    { id: 'coolant',    label: 'Coolant',             km: 60000, months: 36 },
    { id: 'spark',      label: 'Spark plugs',         km: 60000, months: 48 },
    { id: 'wipers',     label: 'Wiper blades',        km: 0,     months: 12 },
    { id: 'battery',    label: '12V battery check',   km: 0,     months: 12 },
    { id: 'alignment',  label: 'Wheel alignment',     km: 20000, months: 12 }
  ];

  var MONTH_DAYS = 30.44;
  var SOON_KM = 1500, SOON_DAYS = 30;

  function itemById(id) {
    for (var i = 0; i < ITEMS.length; i++) if (ITEMS[i].id === id) return ITEMS[i];
    return null;
  }

  function addMonths(date, months) {
    var d = new Date(date.getTime());
    d.setMonth(d.getMonth() + months);
    return d;
  }

  function isoLocal(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  // Status for one item.
  // item: from ITEMS. rec: last service {odo, at ISO} or null (never done -> due now).
  // odoNow: current odometer. today: Date. avgKm: km driven per month.
  function status(item, rec, odoNow, today, avgKm) {
    var now = new Date(today);
    if (!rec) {
      return { id: item.id, label: item.label, state: 'overdue', reason: 'never logged',
               kmLeft: null, daysLeft: null, dueISO: isoLocal(now), score: -1e9 };
    }
    var kmLeft = null, projDays = null;
    if (item.km > 0) {
      var dueKm = rec.odo + item.km;
      kmLeft = dueKm - odoNow;
      projDays = avgKm > 0 ? Math.round(kmLeft / avgKm * MONTH_DAYS) : (kmLeft <= 0 ? -1 : 9999);
    }
    var dueDate = addMonths(new Date(rec.at), item.months);
    var daysLeft = Math.round((dueDate - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);

    // Effective: whichever limit hits first.
    var effDays = daysLeft;
    var driver = 'time';
    if (projDays !== null && projDays < effDays) { effDays = projDays; driver = 'km'; }

    var state;
    if ((kmLeft !== null && kmLeft <= 0) || daysLeft <= 0) state = 'overdue';
    else if ((kmLeft !== null && kmLeft <= SOON_KM) || daysLeft <= SOON_DAYS) state = 'due-soon';
    else state = 'ok';

    var dueISO = driver === 'time' ? isoLocal(dueDate) : isoLocal(new Date(now.getTime() + Math.max(0, projDays) * 86400000));

    return {
      id: item.id, label: item.label, state: state, driver: driver,
      kmLeft: kmLeft, daysLeft: daysLeft, effDays: effDays,
      dueISO: dueISO,
      reason: state === 'ok' ? 'on track'
        : (driver === 'km' ? 'mileage limit first' : 'time limit first'),
      score: effDays
    };
  }

  // Full fleet view, sorted most urgent first.
  function overview(records, odoNow, today, avgKm) {
    var list = ITEMS.map(function (item) {
      return status(item, records[item.id] || null, odoNow, today, avgKm);
    });
    list.sort(function (a, b) { return a.score - b.score; });
    var counts = { overdue: 0, 'due-soon': 0, ok: 0 };
    list.forEach(function (s) { counts[s.state]++; });
    return { items: list, counts: counts, next: list[0] || null };
  }

  // Service history stats.
  function historyStats(records) {
    var ids = Object.keys(records);
    var newest = null;
    ids.forEach(function (id) {
      var at = new Date(records[id].at);
      if (!newest || at > newest) newest = at;
    });
    return { tracked: ids.length, total: ITEMS.length, lastServiceISO: newest ? isoLocal(newest) : null };
  }

  var api = { ITEMS: ITEMS, itemById: itemById, addMonths: addMonths, isoLocal: isoLocal,
    status: status, overview: overview, historyStats: historyStats,
    SOON_KM: SOON_KM, SOON_DAYS: SOON_DAYS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MileEngine = api;
})(typeof self !== 'undefined' ? self : this);
