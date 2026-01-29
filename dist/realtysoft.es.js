var Ke = Object.defineProperty;
var Ge = (_, n, e) => n in _ ? Ke(_, n, { enumerable: !0, configurable: !0, writable: !0, value: e }) : _[n] = e;
var o = (_, n, e) => Ge(_, typeof n != "symbol" ? n + "" : n, e);
/*! RealtySoft Widget v3.0.0 */
const D = function() {
  const _ = {
    // Search filters
    filters: {
      location: null,
      locationName: "",
      listingType: null,
      propertyType: null,
      propertyTypeName: "",
      bedsMin: null,
      bedsMax: null,
      bathsMin: null,
      bathsMax: null,
      priceMin: null,
      priceMax: null,
      builtMin: null,
      builtMax: null,
      plotMin: null,
      plotMax: null,
      features: [],
      ref: ""
    },
    // Locked filters (from data attributes)
    lockedFilters: {},
    // Results
    results: {
      properties: [],
      total: 0,
      page: 1,
      perPage: 12,
      totalPages: 0
    },
    // Current property (detail page)
    currentProperty: null,
    // UI state
    ui: {
      view: "grid",
      sort: "create_date_desc",
      loading: !1,
      error: null
    },
    // Wishlist
    wishlist: [],
    // Data from API
    data: {
      locations: [],
      propertyTypes: [],
      features: [],
      labels: {}
    },
    // Config
    config: {
      apiKey: null,
      apiUrl: null,
      language: "en_US",
      ownerEmail: null,
      privacyPolicyUrl: null,
      features: [],
      propertyPageSlug: "property",
      useWidgetPropertyTemplate: !0,
      useQueryParamUrls: !1,
      propertyUrlFormat: "seo",
      resultsPage: "",
      defaultCountryCode: "ES",
      inquiryThankYouMessage: null,
      inquiryThankYouUrl: null
    }
  }, n = {};
  function e() {
    return JSON.parse(JSON.stringify(_));
  }
  function t(u) {
    const b = u.split(".");
    let M = _;
    for (const z of b) {
      if (M == null)
        return;
      M = M[z];
    }
    if (M !== void 0)
      return JSON.parse(JSON.stringify(M));
  }
  function s(u, b) {
    const M = u.split(".");
    let z = _;
    for (let U = 0; U < M.length - 1; U++)
      z[M[U]] === void 0 && (z[M[U]] = {}), z = z[M[U]];
    const W = M[M.length - 1], G = z[W];
    z[W] = b, a(u, b, G);
  }
  function i(u) {
    for (const [b, M] of Object.entries(u))
      s(b, M);
  }
  function r(u, b) {
    return n[u] || (n[u] = []), n[u].push(b), function() {
      const z = n[u].indexOf(b);
      z > -1 && n[u].splice(z, 1);
    };
  }
  function a(u, b, M) {
    n[u] && n[u].forEach((W) => W(b, M, u));
    const z = u.split(".");
    for (let W = z.length - 1; W > 0; W--) {
      const G = z.slice(0, W).join(".");
      n[G] && n[G].forEach((U) => U(t(G), null, u));
    }
    n["*"] && n["*"].forEach((W) => W(b, M, u));
  }
  function l() {
    const u = {
      location: null,
      locationName: "",
      listingType: null,
      propertyType: null,
      propertyTypeName: "",
      bedsMin: null,
      bedsMax: null,
      bathsMin: null,
      bathsMax: null,
      priceMin: null,
      priceMax: null,
      builtMin: null,
      builtMax: null,
      plotMin: null,
      plotMax: null,
      features: [],
      ref: ""
    }, b = _.lockedFilters;
    for (const [M, z] of Object.entries(u)) {
      const W = b[M], G = W ?? z;
      s("filters." + M, G);
    }
    s("results.page", 1);
  }
  function d(u) {
    _.lockedFilters = { ...u };
    for (const [b, M] of Object.entries(u))
      M != null && s(`filters.${b}`, M);
  }
  function y(u) {
    return _.lockedFilters[u] !== void 0 && _.lockedFilters[u] !== null;
  }
  function p() {
    const u = _.filters, b = {};
    return u.location && (b.location_id = Array.isArray(u.location) ? u.location.join(",") : u.location), u.listingType && (b.listing_type = u.listingType), u.propertyType && (b.type_id = Array.isArray(u.propertyType) ? u.propertyType.join(",") : u.propertyType), u.bedsMin && (b.bedrooms_min = u.bedsMin), u.bedsMax && (b.bedrooms_max = u.bedsMax), u.bathsMin && (b.bathrooms_min = u.bathsMin), u.bathsMax && (b.bathrooms_max = u.bathsMax), u.priceMin && (b.list_price_min = u.priceMin), u.priceMax && (b.list_price_max = u.priceMax), u.builtMin && (b.build_size_min = u.builtMin), u.builtMax && (b.build_size_max = u.builtMax), u.plotMin && (b.plot_size_min = u.plotMin), u.plotMax && (b.plot_size_max = u.plotMax), u.features && u.features.length && (b.features = u.features.join(",")), u.ref && (b.ref_no = u.ref), b.page = _.results.page, b.limit = _.results.perPage, b.order = _.ui.sort, b;
  }
  function S(u) {
    _.wishlist.includes(u) || (_.wishlist.push(u), f(), a("wishlist", _.wishlist, null));
  }
  function C(u) {
    const b = _.wishlist.indexOf(u);
    b > -1 && (_.wishlist.splice(b, 1), f(), a("wishlist", _.wishlist, null));
  }
  function k(u) {
    return _.wishlist.includes(u);
  }
  function L() {
    try {
      const u = localStorage.getItem("rs_wishlist");
      u && (_.wishlist = JSON.parse(u));
    } catch {
      console.warn("Could not load wishlist from localStorage");
    }
  }
  function f() {
    try {
      localStorage.setItem("rs_wishlist", JSON.stringify(_.wishlist));
    } catch {
      console.warn("Could not save wishlist to localStorage");
    }
  }
  return L(), {
    getState: e,
    get: t,
    set: s,
    setMultiple: i,
    subscribe: r,
    resetFilters: l,
    setLockedFilters: d,
    isFilterLocked: y,
    getSearchParams: p,
    addToWishlist: S,
    removeFromWishlist: C,
    isInWishlist: k
  };
}();
typeof window < "u" && (window.RealtySoftState = D);
class Ce {
  constructor(n) {
    o(this, "capacity");
    o(this, "map");
    o(this, "head");
    o(this, "tail");
    this.capacity = Math.max(1, n), this.map = /* @__PURE__ */ new Map(), this.head = null, this.tail = null;
  }
  get size() {
    return this.map.size;
  }
  get(n) {
    const e = this.map.get(n);
    if (e)
      return this.moveToHead(e), e.value;
  }
  set(n, e) {
    const t = this.map.get(n);
    if (t) {
      t.value = e, this.moveToHead(t);
      return;
    }
    const s = { key: n, value: e, prev: null, next: null };
    this.map.set(n, s), this.addToHead(s), this.map.size > this.capacity && this.evict();
  }
  delete(n) {
    const e = this.map.get(n);
    return e ? (this.removeNode(e), this.map.delete(n), !0) : !1;
  }
  clear() {
    this.map.clear(), this.head = null, this.tail = null;
  }
  has(n) {
    return this.map.has(n);
  }
  addToHead(n) {
    n.prev = null, n.next = this.head, this.head && (this.head.prev = n), this.head = n, this.tail || (this.tail = n);
  }
  removeNode(n) {
    n.prev ? n.prev.next = n.next : this.head = n.next, n.next ? n.next.prev = n.prev : this.tail = n.prev, n.prev = null, n.next = null;
  }
  moveToHead(n) {
    this.head !== n && (this.removeNode(n), this.addToHead(n));
  }
  evict() {
    if (!this.tail) return;
    const n = this.tail;
    this.removeNode(n), this.map.delete(n.key);
  }
}
const se = function() {
  const _ = {
    locations: 864e5,
    // 24 hours
    propertyTypes: 864e5,
    // 24 hours
    features: 864e5,
    // 24 hours
    labels: 864e5,
    // 24 hours
    search: 864e5,
    // 24 hours
    property: 36e5
    // 1 hour
  };
  let n = {}, e = new Ce(100);
  function t(c) {
    const x = n[c];
    return typeof x == "number" && x >= 0 ? x : _[c];
  }
  const s = {
    CACHE_PREFIX: "rs_cache_",
    get(c, x) {
      if (n.disabled) return null;
      const $ = x ? t(x) : _.locations, F = this.CACHE_PREFIX + c, j = e.get(F);
      if (j)
        if (Date.now() - j.timestamp > $)
          e.delete(F);
        else
          return j.data;
      try {
        const Y = localStorage.getItem(F);
        if (!Y) return null;
        const { data: Z, timestamp: Q } = JSON.parse(Y);
        return Date.now() - Q > $ ? (localStorage.removeItem(F), null) : (e.set(F, { data: Z, timestamp: Q }), Z);
      } catch (Y) {
        return console.warn("Cache read error:", Y), null;
      }
    },
    set(c, x) {
      if (n.disabled) return;
      const $ = this.CACHE_PREFIX + c, F = Date.now();
      e.set($, { data: x, timestamp: F });
      try {
        localStorage.setItem($, JSON.stringify({ data: x, timestamp: F }));
      } catch (j) {
        console.warn("Cache write error (localStorage):", j);
      }
    },
    clear(c) {
      try {
        if (c) {
          const x = this.CACHE_PREFIX + c;
          e.delete(x), localStorage.removeItem(x);
        } else
          e.clear(), Object.keys(localStorage).filter((x) => x.startsWith(this.CACHE_PREFIX)).forEach((x) => localStorage.removeItem(x));
      } catch (x) {
        console.warn("Cache clear error:", x);
      }
    }
  };
  function i(c) {
    let x = 0;
    for (let $ = 0; $ < c.length; $++) {
      const F = c.charCodeAt($);
      x = (x << 5) - x + F, x = x & x;
    }
    return Math.abs(x).toString(16);
  }
  const r = /* @__PURE__ */ new Map();
  let a = {
    proxyUrl: "https://realtysoft.ai/propertymanager/php/api-proxy.php",
    inquiryEndpoint: "https://realtysoft.ai/propertymanager/php/send-inquiry.php",
    apiKey: null,
    apiUrl: null,
    language: "en_US"
  };
  function l(c) {
    a = { ...a, ...c }, n = c.cache ? { ...c.cache } : {};
    const x = n.maxCacheEntries ?? 100;
    e = new Ce(x);
  }
  async function d(c, x = {}, $ = "GET", F = {}) {
    const j = c + "_" + i(JSON.stringify(x)) + "_" + $;
    if (r.has(j))
      return console.log("[RealtySoft] Deduplicating request:", c), r.get(j);
    const Y = new URL(a.proxyUrl, window.location.origin), Z = { ...x, _endpoint: c };
    F.skipLang || (Z._lang = a.language), Z._t = Date.now(), $ === "GET" && Object.keys(Z).forEach((T) => {
      Z[T] !== null && Z[T] !== void 0 && Y.searchParams.append(T, String(Z[T]));
    });
    const Q = {
      method: $,
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest"
      }
    };
    $ === "POST" && (Q.body = JSON.stringify(Z));
    const w = (async () => {
      try {
        const T = await fetch(Y.toString(), Q);
        if (!T.ok)
          throw new Error(`HTTP error! status: ${T.status}`);
        const O = await T.json();
        if (O.error)
          throw new Error(O.error);
        return O;
      } catch (T) {
        throw console.error("API Error:", T), T;
      } finally {
        r.delete(j);
      }
    })();
    return r.set(j, w), w;
  }
  async function y(c = null) {
    const x = "locations" + (c ? "_" + c : ""), $ = s.get(x, "locations");
    if ($)
      return console.log("[RealtySoft] Locations loaded from cache"), $;
    const F = { page: 1, limit: 1e3 };
    c && (F.parent_id = c);
    const j = await d("v1/location", F, "GET", {
      skipLang: !0
    }), Y = /* @__PURE__ */ new Set(), Z = (j.data || []).filter((w) => Y.has(w.id) ? !1 : (Y.add(w.id), !0)), Q = {
      data: Z,
      count: j.count || Z.length
    };
    return s.set(x, Q), console.log("[RealtySoft] Locations cached"), Q;
  }
  async function p() {
    const c = "parentLocations", x = s.get(c, "locations");
    if (x)
      return console.log("[RealtySoft] Parent locations loaded from cache"), x;
    const $ = await d(
      "v1/location",
      { parent_id: 0 },
      "GET",
      { skipLang: !0 }
    );
    return s.set(c, $), console.log("[RealtySoft] Parent locations cached"), $;
  }
  async function S(c) {
    const x = "childLocations_" + c, $ = s.get(x, "locations");
    if ($)
      return console.log("[RealtySoft] Child locations loaded from cache for parent:", c), $;
    const F = await d(
      "v1/location",
      { parent_id: c },
      "GET",
      { skipLang: !0 }
    );
    return s.set(x, F), console.log("[RealtySoft] Child locations cached for parent:", c), F;
  }
  async function C(c) {
    return await d("v1/search_location", { q: c });
  }
  async function k(c) {
    return await d("v1/relevant_location", { id: c });
  }
  async function L() {
    const c = "propertyTypes_" + a.language, x = s.get(c, "propertyTypes");
    if (x)
      return console.log("[RealtySoft] Property types loaded from cache"), x;
    const $ = await d("v1/property_types");
    return s.set(c, $), console.log("[RealtySoft] Property types cached"), $;
  }
  async function f() {
    const c = "features_" + a.language, x = s.get(c, "features");
    if (x)
      return console.log("[RealtySoft] Features loaded from cache"), x;
    const $ = await d("v1/property_features");
    return s.set(c, $), console.log("[RealtySoft] Features cached"), $;
  }
  async function u() {
    const c = "labels_" + a.language, x = s.get(c, "labels");
    if (x)
      return console.log("[RealtySoft] Labels loaded from cache"), x;
    const $ = window.__rsPrefetch;
    let F;
    if ($ != null && $.labels && (!$.lang || $.lang === a.language)) {
      const j = await $.labels;
      delete $.labels, j ? (console.log("[RealtySoft] Labels loaded from PHP prefetch"), F = j) : F = await d("v1/plugin_labels");
    } else
      F = await d("v1/plugin_labels");
    return s.set(c, F), console.log("[RealtySoft] Labels cached"), F;
  }
  async function b() {
    const c = "labels_all", x = s.get(c, "labels");
    if (x)
      return x;
    const $ = await d("v1/plugin_labels", {}, "GET", { skipLang: !0 });
    return s.set(c, $), $;
  }
  function M(c) {
    var g, m, v, P, R, q, B, H, re, ee, J, de, oe, he;
    if (!c) return null;
    let x = [], $ = [], F = [];
    c.images && Array.isArray(c.images) && (x = c.images.map((V) => typeof V == "string" ? V : V.image_256 || V.image_512 || V.image_768 || V.src || V.url || "").filter(Boolean), $ = c.images.map((V) => typeof V == "string" ? V : V.image_1024 || V.image_768 || V.image_512 || V.src || V.url || "").filter(Boolean), F = c.images.map((V) => {
      if (typeof V == "string") return { src: V, sizes: {} };
      const ae = V.image_256 || V.image_512 || V.image_768 || V.src || V.url || "";
      return ae ? {
        src: ae,
        sizes: {
          256: V.image_256,
          512: V.image_512,
          768: V.image_768,
          1024: V.image_1024
        }
      } : null;
    }).filter((V) => V !== null && !!V.src));
    const j = ((g = c.location_id) == null ? void 0 : g.name) || ((m = c.location) == null ? void 0 : m.name) || ((v = c.city_id) == null ? void 0 : v.name) || ((P = c.municipality_id) == null ? void 0 : P.name) || (typeof c.location == "string" ? c.location : "") || c.address || "", Y = ((R = c.type_id) == null ? void 0 : R.name) || ((q = c.type) == null ? void 0 : q.name) || ((B = c.property_type) == null ? void 0 : B.name) || (typeof c.type == "string" ? c.type : "") || "", Z = c.listing_type || ((H = c.listing_type_id) == null ? void 0 : H.code) || c.status || "resale";
    let Q = [];
    const w = c.features || c.amenities;
    w && Array.isArray(w) && (Q = w.map((V) => {
      var ve;
      if (typeof V == "string") return { name: V, category: "Features" };
      const ae = V.name || V.label || V.title || "";
      return ae ? {
        name: ae,
        category: ((ve = V.attr_id) == null ? void 0 : ve.name) || V.category || "Features"
      } : null;
    }).filter((V) => V !== null));
    const T = c.agent || c.listing_agent || c.contact || c.user, O = T ? {
      name: T.name || T.full_name || T.display_name || "",
      email: T.email || "",
      phone: T.phone || T.telephone || T.mobile || "",
      photo: T.photo || T.avatar || T.image || ""
    } : null, h = (V) => V === !0 || V === 1 || V === "1";
    return {
      id: c.id,
      title: c.title || c.name || c.headline || "",
      ref: c.ref_no || c.ref || c.reference || "",
      unique_ref: c.unique_ref || c.unique_reference || c.external_ref || "",
      price: c.list_price || c.price || c.asking_price || 0,
      price_on_request: c.price_on_request || c.hide_price || !1,
      location: j,
      postal_code: c.postal_code || c.zipcode || c.zip || c.postcode || "",
      address: c.address || c.street_address || "",
      beds: c.bedrooms || c.beds || 0,
      baths: c.bathrooms || c.baths || 0,
      built_area: c.build_size || c.built_area || c.built || c.building_size || c.constructed_area || c.m2_pivienda || c.size || 0,
      plot_size: c.plot_size || c.plot || c.land_area || c.terrain_size || c.m2_parcela || 0,
      terrace_size: c.terrace_size || c.terrace_area || (typeof c.terrace == "number" ? c.terrace : 0) || c.m2_terraza || 0,
      solarium_size: c.solarium_size || c.solarium_area || (typeof c.solarium == "number" ? c.solarium : 0) || c.m2_solarium || 0,
      garden_size: c.garden_size || c.garden_area || (typeof c.garden == "number" ? c.garden : 0) || c.m2_jardin || 0,
      usable_area: c.usable_area || c.usable_size || c.useful_area || c.m2_utiles || 0,
      images: x,
      imagesFull: $,
      imagesWithSizes: F,
      total_images: ((re = c.images) == null ? void 0 : re.length) || 0,
      url: c.url || c.link || c.permalink || null,
      listing_type: Z,
      status: c.status || ((ee = c.listing_type_id) == null ? void 0 : ee.name) || c.listing_status || "",
      type: Y,
      is_featured: h(c.is_featured),
      is_own: h(c.is_own),
      is_new: h(c.is_new),
      is_exclusive: h(c.is_exclusive),
      description: c.desc || c.description || c.full_description || "",
      short_description: c.short_description || c.summary || "",
      features: Q,
      agent: O,
      latitude: c.latitude || c.lat || c.geo_lat || null,
      longitude: c.longitude || c.lng || c.lon || c.geo_lng || null,
      year_built: c.year_built || c.construction_year || c.built_year || null,
      community_fees: c.community_fees_monthly || c.community_fees || c.comm_fees || c.community_cost || c.gastos_comunidad || c.monthly_community_fees || null,
      ibi_tax: c.ibi_fees || c.ibi_tax || c.ibi || c.ibi_annual || c.ibi_yearly || null,
      basura_tax: c.basura_tax || c.basura_fees || c.garbage_tax || c.basura || c.waste_tax || null,
      energy_rating: c.energy_rating || ((J = c.energy_certificate) == null ? void 0 : J.rating) || c.energy_class || "",
      co2_rating: c.co2_rating || c.co2_emission || ((de = c.energy_certificate) == null ? void 0 : de.co2) || "",
      energy_certificate_image: c.energy_certificate_image || ((oe = c.energy_certificate) == null ? void 0 : oe.image) || c.energy_image || "",
      energy_consumption: c.energy_consumption || ((he = c.energy_certificate) == null ? void 0 : he.consumption) || "",
      video_url: c.video_url || c.video || c.youtube_url || "",
      virtual_tour_url: c.virtual_tour_url || c.virtual_tour || c.tour_360 || c.matterport_url || "",
      pdf_url: c.pdf_url || c.pdf || c.brochure_url || c.brochure || c.pdf_link || c.document_url || c.flyer_url || c.flyer || "",
      floor: c.floor || c.floor_number || "",
      orientation: c.orientation || "",
      parking: c.parking || c.parking_spaces || c.garage || 0,
      pool: c.pool || c.swimming_pool || !1,
      furnished: c.furnished || c.furniture || "",
      condition: c.condition || c.property_condition || "",
      views: c.views || c.view_type || "",
      created_at: c.created_at || c.date_added || c.listed_date || "",
      updated_at: c.updated_at || c.date_modified || c.last_updated || "",
      _original: c
    };
  }
  function z(c) {
    return Array.isArray(c) ? c.map((x) => M(x)).filter((x) => x !== null) : [];
  }
  async function W(c) {
    const x = "search_" + i(JSON.stringify(c)), $ = s.get(x, "search");
    if ($)
      return console.log("[RealtySoft] Search results from cache"), $;
    const F = await d("v1/property", c), j = {
      ...F,
      data: z(F.data)
    };
    return j.data && (j.data.forEach((Y) => {
      Y.id && G(Y);
    }), s.set(x, j), console.log("[RealtySoft] Search results cached")), j;
  }
  function G(c) {
    if (!c || !c.id) return;
    const x = "property_" + c.id;
    if (s.set(x, c), c.ref) {
      const $ = "property_ref_" + c.ref;
      s.set($, c);
    }
  }
  function U(c, x = !1) {
    const $ = x ? "property_ref_" + c : "property_" + c;
    return s.get($, "property");
  }
  async function te(c, x = !1) {
    let $;
    const F = window.__rsPrefetch, j = String(c).toLowerCase(), Y = ((F == null ? void 0 : F.ref) || "").toLowerCase();
    if (F != null && F.property && x && Y === j && Y !== "") {
      const Q = await F.property;
      if (delete F.property, Q) {
        const w = Q, T = Array.isArray(w.data) ? w.data[0] : w.data, O = ((T == null ? void 0 : T.ref) || (T == null ? void 0 : T.ref_no) || (T == null ? void 0 : T.reference) || "").toLowerCase();
        O === j ? (console.log("[RealtySoft] Property loaded from PHP prefetch:", j), $ = w) : (console.warn("[RealtySoft] Prefetch data mismatch - expected:", j, "got:", O, "- fetching from API"), delete window.__rsPrefetch, $ = await d("v1/property", x ? { ref_no: c } : { id: c }));
      } else
        $ = await d("v1/property", x ? { ref_no: c } : { id: c });
    } else
      F != null && F.property && x && Y !== j && (console.log("[RealtySoft] Clearing stale prefetch - expected:", j, "prefetch has:", Y), delete window.__rsPrefetch), $ = await d("v1/property", x ? { ref_no: c } : { id: c });
    let Z = null;
    if ($ && $.data ? Array.isArray($.data) && $.data.length > 0 ? Z = M($.data[0]) : Array.isArray($.data) || (Z = M($.data)) : $ && !$.data && (Z = M($)), Z)
      return G(Z), { data: Z };
    throw new Error("Property not found");
  }
  async function E(c, x = {}) {
    const $ = U(c);
    return $ && !x.forceRefresh ? (console.log("[RealtySoft] Property loaded from cache:", c), x.skipBackgroundRefresh || te(c, !1).catch(() => {
    }), { data: $, fromCache: !0 }) : await te(c, !1);
  }
  async function N(c, x = {}) {
    const $ = U(c, !0);
    return $ && !x.forceRefresh ? (console.log("[RealtySoft] Property loaded from cache (ref):", c), x.skipBackgroundRefresh || te(c, !0).catch(() => {
    }), { data: $, fromCache: !0 }) : await te(c, !0);
  }
  async function K(c, x = !1) {
    if (!U(c, x))
      try {
        await te(c, x), console.log("[RealtySoft] Prefetched property:", c);
      } catch {
      }
  }
  async function ie(c, x = 6) {
    const $ = await d("v1/property", {
      related_to: c,
      per_page: x
    });
    return {
      ...$,
      data: z($.data)
    };
  }
  async function X(c) {
    const x = a.inquiryEndpoint || "https://realtysoft.ai/propertymanager/php/send-inquiry.php", $ = await fetch(x, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest"
      },
      body: JSON.stringify(c)
    }), F = await $.json();
    if (!$.ok || F.success === !1) {
      const j = F.message || F.error || "Failed to submit inquiry";
      throw console.error("Inquiry error:", j), new Error(j);
    }
    return F;
  }
  async function ce(c) {
    if (!c.length) return { data: [], total: 0 };
    const x = await d("v1/property", {
      ids: c.join(",")
    });
    return {
      ...x,
      data: z(x.data)
    };
  }
  return {
    init: l,
    request: d,
    getLocations: y,
    getParentLocations: p,
    getChildLocations: S,
    searchLocations: C,
    getRelevantLocations: k,
    getPropertyTypes: L,
    getFeatures: f,
    getLabels: u,
    getAllLabels: b,
    searchProperties: W,
    getProperty: E,
    getPropertyByRef: N,
    getRelatedProperties: ie,
    submitInquiry: X,
    getWishlistProperties: ce,
    prefetchProperty: K,
    getCachedProperty: U,
    cacheProperty: G,
    clearCache: s.clear.bind(s)
  };
}();
typeof window < "u" && (window.RealtySoftAPI = se);
const pe = function() {
  const _ = {
    // Search
    search_location: "Location",
    search_location_placeholder: "Search location...",
    search_sublocation: "Sub-location",
    search_listing_type: "Status",
    search_listing_type_all: "Status",
    search_sale: "ReSale",
    search_rent: "For Rent",
    listing_type_sale: "ReSale",
    listing_type_new: "New Development",
    listing_type_long_rental: "Long Term Rental",
    listing_type_short_rental: "Holiday Rental",
    search_property_type: "Property Type",
    search_property_type_placeholder: "Any property type",
    search_bedrooms: "Bedrooms",
    search_bedrooms_any: "Min Bed",
    search_bedrooms_select: "Select Bedrooms",
    search_bedrooms_input: "e.g., 3",
    search_bathrooms: "Bathrooms",
    search_bathrooms_any: "Min Bath",
    search_bathrooms_select: "Select Bathrooms",
    search_bathrooms_input: "e.g., 2",
    search_price: "Price",
    search_price_min: "Min Price",
    search_price_max: "Max Price",
    search_price_select_min: "Select Min Price",
    search_price_select_max: "Select Max Price",
    search_price_input_min: "Min (e.g., 200000)",
    search_price_input_max: "Max (e.g., 500000)",
    search_built_area: "Built Area",
    search_plot_size: "Plot Size",
    search_features: "Features",
    search_features_placeholder: "Select Features",
    search_features_filter: "Search features...",
    search_reference: "Reference",
    search_button: "Search",
    search_reset: "Reset Filters",
    search_any: "Any",
    search_all: "All",
    search_min: "Min",
    search_max: "Max",
    // Results
    results_count: "{count} properties found",
    results_count_one: "1 property found",
    results_count_zero: "No properties found",
    results_sort: "Sort by",
    results_view_grid: "Grid",
    results_view_list: "List",
    results_loading: "Loading...",
    // Sort options
    sort_newest: "Newest Listings",
    sort_oldest: "Oldest Listings",
    sort_updated: "Recently Updated",
    sort_oldest_updated: "Oldest Updated",
    sort_price_asc: "Price: Low to High",
    sort_price_desc: "Price: High to Low",
    sort_featured: "Featured First",
    sort_location: "By Location",
    sort_own: "Own Properties First",
    sort_recent: "Recently Added",
    sort_name: "Name: A-Z",
    // AI Search
    ai_search_title: "AI Search",
    ai_search_back: "Back to filters",
    ai_search_placeholder: `Describe your dream property...
e.g., 3 bedroom villa with pool near beach under 500k`,
    ai_search_try: "Try:",
    ai_search_button: "Search",
    ai_search_empty: "Please describe what you're looking for",
    ai_search_error: "Could not understand your search. Please try again.",
    ai_search_example_1: "modern apartment with sea views",
    ai_search_example_2: "family villa with garden under 400k",
    ai_search_example_3: "2 bedroom rental near beach",
    // Property card
    card_bed: "bed",
    card_beds: "beds",
    card_bath: "bath",
    card_baths: "baths",
    card_built: "m²",
    card_plot: "m²",
    card_view: "View Details",
    card_ref: "Ref:",
    // Property detail
    detail_description: "Description",
    detail_features: "Features",
    detail_location: "Location",
    detail_sublocation: "Sublocation",
    detail_contact: "Contact Agent",
    detail_share: "Share",
    detail_back: "Back to Results",
    detail_back_to_search: "Back to Search",
    detail_related: "Similar Properties",
    detail_year_built: "Year Built",
    detail_property_type: "Property Type",
    detail_status: "Status",
    detail_reference: "Reference",
    detail_unique_ref: "Unique Reference",
    detail_postal_code: "Postal Code",
    detail_floor: "Floor",
    detail_orientation: "Orientation",
    detail_condition: "Condition",
    detail_furnished: "Furnished",
    detail_views: "Views",
    detail_parking: "Parking",
    detail_built_area: "Built Area",
    detail_plot_size: "Plot Size",
    detail_usable_area: "Usable Area",
    detail_terrace: "Terrace",
    detail_solarium: "Solarium",
    detail_garden: "Garden",
    detail_sizes: "Property Sizes",
    detail_property_info: "Property Information",
    detail_taxes_fees: "Taxes & Fees",
    detail_community_fees: "Community Fees",
    detail_ibi_tax: "IBI Tax",
    detail_basura_tax: "Basura Tax",
    detail_per_month: "/month",
    detail_per_year: "/year",
    detail_energy_certificate: "Energy Certificate",
    detail_energy_rating: "Energy Rating",
    detail_co2_rating: "CO2 Rating",
    detail_additional_resources: "Additional Resources",
    detail_video_tour: "Video Tour",
    detail_virtual_tour: "Virtual Tour",
    detail_download_pdf: "Download PDF",
    detail_read_more: "Read More",
    detail_read_less: "Read Less",
    detail_loading_map: "Loading map...",
    detail_price: "Price",
    detail_price_on_request: "Price on Request",
    // Wishlist
    sort_by: "Sort By",
    wishlist_add: "Add to Wishlist",
    wishlist_remove: "Remove from Wishlist",
    wishlist_title: "My Wishlist",
    wishlist_shared_title: "Shared Wishlist",
    wishlist_empty: "Your wishlist is empty",
    wishlist_empty_desc: "Start adding properties by clicking the heart icon",
    wishlist_share: "Share",
    wishlist_email: "Email",
    wishlist_pdf: "Download PDF",
    wishlist_clear: "Clear All",
    wishlist_back: "Back to Results",
    wishlist_browse: "Browse Properties",
    wishlist_add_note: "Add Note",
    wishlist_compare: "Compare",
    wishlist_confirm_remove: "Remove this property from your wishlist?",
    wishlist_confirm_clear: "Are you sure you want to clear your entire wishlist?",
    wishlist_removed: "Removed from wishlist",
    wishlist_cleared: "Wishlist cleared",
    wishlist_no_share: "No properties to share",
    wishlist_loading_shared: "Loading shared properties...",
    wishlist_shared_empty: "No properties found in shared wishlist",
    wishlist_shared_desc: "This is a read-only view of saved properties",
    wishlist_error: "Error loading wishlist",
    wishlist_no_properties: "No properties saved",
    wishlist_share_title: "Share Your Wishlist",
    wishlist_share_desc: "Share this link with anyone to show them your saved properties:",
    wishlist_email_title: "Email Your Wishlist",
    wishlist_email_to: "Send to:",
    wishlist_email_from: "Your email (optional):",
    wishlist_email_message: "Personal message (optional):",
    wishlist_email_placeholder: "Add a personal note...",
    wishlist_email_send: "Send Email",
    wishlist_email_sent: "Email sent successfully!",
    wishlist_email_error: "Failed to send email",
    wishlist_note_title: "Add Property Note",
    wishlist_note_label: "Your note:",
    wishlist_note_placeholder: "Add your thoughts, questions, or reminders...",
    wishlist_compare_title: "Compare Properties",
    wishlist_compare_clear: "Clear Selection",
    // Sort options for wishlist
    sort_wishlist_recent: "Recently Added",
    sort_wishlist_oldest: "Oldest First",
    sort_wishlist_name: "Name: A-Z",
    // Common
    view_details: "View Details",
    no_results: "No results found",
    compare: "Compare",
    compare_max: "Maximum",
    compare_min: "Select at least 2 properties to compare",
    compare_confirm_clear: "Clear all selected properties?",
    added: "Added",
    note: "Note",
    note_saved: "Note saved!",
    note_deleted: "Note deleted",
    confirm_delete_note: "Delete this note?",
    copy: "Copy",
    copied: "Link copied to clipboard!",
    cancel: "Cancel",
    close: "Close",
    save: "Save",
    delete: "Delete",
    error: "Error",
    property: "property",
    properties: "properties",
    saved: "saved",
    feature: "Feature",
    price: "Price",
    location: "Location",
    type: "Type",
    bedrooms: "Bedrooms",
    bathrooms: "Bathrooms",
    build_size: "Build Size",
    plot_size: "Plot Size",
    status: "Status",
    featured: "Featured",
    own: "Own",
    // Inquiry form
    inquiry_name: "Your Name",
    inquiry_first_name: "First Name",
    inquiry_last_name: "Last Name",
    inquiry_email: "Your Email",
    inquiry_phone: "Your Phone",
    inquiry_message: "Message",
    inquiry_submit: "Send Inquiry",
    inquiry_sending: "Sending...",
    inquiry_success: "Thank you! Your inquiry has been sent.",
    inquiry_error: "Sorry, there was an error. Please try again.",
    inquiry_privacy: "I accept the privacy policy",
    inquiry_privacy_accept: "I accept the",
    inquiry_privacy_policy: "privacy policy",
    inquiry_country: "Country",
    // Pagination
    pagination_prev: "Previous",
    pagination_next: "Next",
    pagination_page: "Page",
    pagination_of: "of",
    pagination_load_more: "Load More",
    // General
    general_error: "An error occurred",
    general_retry: "Try Again",
    general_close: "Close",
    general_select: "Select",
    general_selected: "Selected",
    general_clear: "Clear",
    // Map
    detail_view_larger_map: "View Larger Map",
    detail_get_directions: "Get Directions",
    map_precision_exact: "Exact location",
    map_precision_zipcode: "Postal code area",
    map_precision_area: "Area"
  }, n = {
    es_ES: {
      // Search
      search_location: "Localidad",
      search_location_placeholder: "Buscar localidad...",
      search_sublocation: "Ubicación",
      search_listing_type: "Estatus",
      search_listing_type_all: "Estatus",
      search_sale: "Ventas",
      search_rent: "Alquileres",
      listing_type_sale: "Ventas",
      listing_type_new: "Nuevas Promociones",
      listing_type_long_rental: "Alquileres",
      listing_type_short_rental: "Alquileres vacacionales",
      search_property_type: "Tipo de propiedad",
      search_property_type_placeholder: "Cualquier tipo",
      search_bedrooms: "Dormitorios",
      search_bedrooms_any: "Dorm. mín.",
      search_bedrooms_select: "Seleccionar dormitorios",
      search_bathrooms: "Baños",
      search_bathrooms_any: "Baños mín.",
      search_bathrooms_select: "Seleccionar baños",
      search_price: "Precio",
      search_price_min: "Precio mín.",
      search_price_max: "Precio máx.",
      search_price_select_min: "Seleccionar precio mín.",
      search_price_select_max: "Seleccionar precio máx.",
      search_built_area: "Superficie construida",
      search_plot_size: "Parcela",
      search_features: "Características",
      search_features_placeholder: "Seleccionar características",
      search_features_filter: "Buscar características...",
      search_reference: "Referencia",
      search_button: "Buscar",
      search_reset: "Reiniciar",
      search_any: "Cualquiera",
      search_all: "Todos",
      search_min: "Mín.",
      search_max: "Máx.",
      // Results
      results_count: "{count} propiedades encontradas",
      results_count_one: "1 propiedad encontrada",
      results_count_zero: "No se encontraron propiedades",
      results_sort: "Ordenar por",
      results_view_grid: "Cuadrícula",
      results_view_list: "Lista",
      results_loading: "Cargando...",
      // Sort
      sort_newest: "Más recientes",
      sort_oldest: "Más antiguas",
      sort_updated: "Actualización reciente",
      sort_oldest_updated: "Actualización más antigua",
      sort_price_asc: "Precio: menor a mayor",
      sort_price_desc: "Precio: mayor a menor",
      sort_featured: "Destacados primero",
      sort_location: "Por ubicación",
      sort_own: "Propiedades propias primero",
      sort_by: "Ordenar por",
      sort_recent: "Añadidos recientemente",
      sort_name: "Nombre: A-Z",
      // AI Search
      ai_search_title: "Búsqueda IA",
      ai_search_back: "Volver a filtros",
      ai_search_placeholder: `Describe tu propiedad ideal...
ej., villa de 3 dormitorios con piscina cerca de la playa menos de 500k`,
      ai_search_try: "Prueba:",
      ai_search_button: "Buscar",
      ai_search_empty: "Por favor describe lo que buscas",
      ai_search_error: "No pudimos entender tu búsqueda. Inténtalo de nuevo.",
      ai_search_example_1: "apartamento moderno con vistas al mar",
      ai_search_example_2: "villa familiar con jardín menos de 400k",
      ai_search_example_3: "alquiler de 2 dormitorios cerca de la playa",
      // Card
      card_bed: "dorm.",
      card_beds: "dorm.",
      card_bath: "baño",
      card_baths: "baños",
      card_view: "Ver detalles",
      card_ref: "Ref:",
      // Detail
      detail_description: "Descripción",
      detail_features: "Características",
      detail_location: "Ubicación",
      detail_contact: "Contactar agente",
      detail_share: "Compartir",
      detail_back: "Volver a resultados",
      detail_back_to_search: "Volver a búsqueda",
      detail_related: "Propiedades similares",
      detail_year_built: "Año de construcción",
      detail_property_type: "Tipo de propiedad",
      detail_status: "Estatus",
      detail_reference: "Referencia",
      detail_unique_ref: "Referencia única",
      detail_floor: "Planta",
      detail_orientation: "Orientación",
      detail_condition: "Condición",
      detail_furnished: "Amueblado",
      detail_views: "Vistas",
      detail_parking: "Aparcamiento",
      detail_built_area: "Superficie construida",
      detail_plot_size: "Parcela",
      detail_usable_area: "Superficie útil",
      detail_terrace: "Terraza",
      detail_sizes: "Medidas de la propiedad",
      detail_property_info: "Información de la propiedad",
      detail_taxes_fees: "Impuestos y tasas",
      detail_community_fees: "Cuota de comunidad",
      detail_ibi_tax: "IBI",
      detail_basura_tax: "Basura",
      detail_per_month: "/mes",
      detail_per_year: "/año",
      detail_energy_certificate: "Certificado energético",
      detail_energy_rating: "Calificación energética",
      detail_co2_rating: "Calificación CO2",
      detail_video_tour: "Vídeo tour",
      detail_virtual_tour: "Tour virtual",
      detail_download_pdf: "Descargar PDF",
      detail_loading_map: "Cargando mapa...",
      detail_read_more: "Leer más",
      detail_read_less: "Leer menos",
      detail_price_on_request: "Precio bajo demanda",
      detail_view_larger_map: "Ver mapa más grande",
      detail_get_directions: "Cómo llegar",
      // Wishlist
      wishlist_add: "Añadir a favoritos",
      wishlist_remove: "Eliminar de favoritos",
      wishlist_title: "Mi lista de deseos",
      wishlist_empty: "Tu lista de deseos está vacía",
      wishlist_empty_desc: "Añade propiedades haciendo clic en el icono de corazón",
      wishlist_share: "Compartir",
      wishlist_email: "Email",
      wishlist_pdf: "Descargar PDF",
      wishlist_clear: "Borrar todo",
      wishlist_back: "Volver a resultados",
      wishlist_browse: "Ver propiedades",
      wishlist_compare: "Comparar",
      wishlist_confirm_clear: "¿Estás seguro de que quieres borrar toda tu lista de deseos?",
      wishlist_removed: "Eliminado de favoritos",
      wishlist_cleared: "Lista de deseos borrada",
      // Inquiry
      inquiry_name: "Su nombre",
      inquiry_first_name: "Nombre",
      inquiry_last_name: "Apellidos",
      inquiry_email: "Su email",
      inquiry_phone: "Su teléfono",
      inquiry_message: "Mensaje",
      inquiry_submit: "Enviar consulta",
      inquiry_sending: "Enviando...",
      inquiry_success: "¡Gracias! Su consulta ha sido enviada.",
      inquiry_error: "Lo sentimos, ha ocurrido un error. Inténtelo de nuevo.",
      inquiry_privacy_accept: "Acepto la",
      inquiry_privacy_policy: "política de privacidad",
      inquiry_country: "País",
      // Pagination
      pagination_prev: "Anterior",
      pagination_next: "Siguiente",
      pagination_page: "Página",
      pagination_of: "de",
      pagination_load_more: "Cargar más",
      // General
      general_error: "Ha ocurrido un error",
      general_retry: "Reintentar",
      general_close: "Cerrar",
      general_select: "Seleccionar",
      general_selected: "Seleccionado",
      general_clear: "Limpiar",
      view_details: "Ver detalles",
      no_results: "No se encontraron resultados",
      compare: "Comparar",
      cancel: "Cancelar",
      close: "Cerrar",
      save: "Guardar",
      delete: "Eliminar",
      error: "Error",
      property: "propiedad",
      properties: "propiedades",
      featured: "Destacado",
      own: "Exclusiva",
      price: "Precio",
      location: "Ubicación",
      type: "Tipo",
      bedrooms: "Dormitorios",
      bathrooms: "Baños",
      build_size: "Construido",
      plot_size: "Parcela",
      status: "Estatus",
      // Map
      map_precision_exact: "Ubicación exacta",
      map_precision_zipcode: "Código postal",
      map_precision_area: "Zona"
    },
    de_DE: {
      search_location: "Standort",
      search_location_placeholder: "Standort suchen...",
      search_property_type: "Immobilientyp",
      search_bedrooms: "Schlafzimmer",
      search_bedrooms_any: "Min. Schlafz.",
      search_bathrooms: "Badezimmer",
      search_bathrooms_any: "Min. Bäder",
      search_price: "Preis",
      search_price_min: "Min. Preis",
      search_price_max: "Max. Preis",
      search_button: "Suchen",
      search_reset: "Zurücksetzen",
      search_features: "Merkmale",
      search_features_placeholder: "Merkmale auswählen",
      results_count: "{count} Immobilien gefunden",
      results_count_one: "1 Immobilie gefunden",
      results_count_zero: "Keine Immobilien gefunden",
      results_sort: "Sortieren nach",
      results_loading: "Laden...",
      // Sort
      sort_newest: "Neueste",
      sort_oldest: "Älteste",
      sort_updated: "Kürzlich aktualisiert",
      sort_oldest_updated: "Älteste aktualisiert",
      sort_price_asc: "Preis: aufsteigend",
      sort_price_desc: "Preis: absteigend",
      sort_featured: "Empfohlen zuerst",
      sort_location: "Nach Standort",
      sort_own: "Eigene Immobilien zuerst",
      sort_by: "Sortieren nach",
      sort_recent: "Kürzlich hinzugefügt",
      sort_name: "Name: A-Z",
      // AI Search
      ai_search_title: "KI-Suche",
      ai_search_back: "Zurück zu Filtern",
      ai_search_placeholder: `Beschreiben Sie Ihre Traumimmobilie...
z.B., 3-Zimmer-Villa mit Pool in Strandnähe unter 500k`,
      ai_search_try: "Versuchen Sie:",
      ai_search_button: "Suchen",
      ai_search_empty: "Bitte beschreiben Sie, wonach Sie suchen",
      ai_search_error: "Ihre Suche konnte nicht verstanden werden. Bitte versuchen Sie es erneut.",
      ai_search_example_1: "moderne Wohnung mit Meerblick",
      ai_search_example_2: "Familienvilla mit Garten unter 400k",
      ai_search_example_3: "2-Zimmer-Mietwohnung in Strandnähe",
      view_details: "Details anzeigen",
      card_view: "Details anzeigen",
      detail_description: "Beschreibung",
      detail_features: "Merkmale",
      detail_contact: "Agent kontaktieren",
      detail_location: "Standort",
      detail_related: "Ähnliche Immobilien",
      detail_read_more: "Mehr lesen",
      detail_read_less: "Weniger lesen",
      detail_loading_map: "Karte wird geladen...",
      detail_view_larger_map: "Größere Karte anzeigen",
      detail_get_directions: "Wegbeschreibung",
      wishlist_add: "Zur Merkliste hinzufügen",
      wishlist_remove: "Von Merkliste entfernen",
      pagination_prev: "Zurück",
      pagination_next: "Weiter",
      general_close: "Schließen",
      general_clear: "Löschen",
      cancel: "Abbrechen",
      close: "Schließen",
      save: "Speichern",
      no_results: "Keine Ergebnisse gefunden"
    },
    fr_FR: {
      search_location: "Emplacement",
      search_location_placeholder: "Rechercher un lieu...",
      search_property_type: "Type de propriété",
      search_bedrooms: "Chambres",
      search_bedrooms_any: "Chambres min.",
      search_bathrooms: "Salles de bain",
      search_bathrooms_any: "SdB min.",
      search_price: "Prix",
      search_price_min: "Prix min.",
      search_price_max: "Prix max.",
      search_button: "Rechercher",
      search_reset: "Réinitialiser",
      search_features: "Caractéristiques",
      search_features_placeholder: "Sélectionner les caractéristiques",
      results_count: "{count} propriétés trouvées",
      results_count_one: "1 propriété trouvée",
      results_count_zero: "Aucune propriété trouvée",
      results_sort: "Trier par",
      results_loading: "Chargement...",
      // Sort
      sort_newest: "Plus récentes",
      sort_oldest: "Plus anciennes",
      sort_updated: "Récemment mis à jour",
      sort_oldest_updated: "Anciennes mises à jour",
      sort_price_asc: "Prix: croissant",
      sort_price_desc: "Prix: décroissant",
      sort_featured: "En vedette d'abord",
      sort_location: "Par emplacement",
      sort_own: "Nos propriétés d'abord",
      sort_by: "Trier par",
      sort_recent: "Ajoutés récemment",
      sort_name: "Nom: A-Z",
      // AI Search
      ai_search_title: "Recherche IA",
      ai_search_back: "Retour aux filtres",
      ai_search_placeholder: `Décrivez votre propriété idéale...
ex., villa 3 chambres avec piscine près de la plage moins de 500k`,
      ai_search_try: "Essayez:",
      ai_search_button: "Rechercher",
      ai_search_empty: "Veuillez décrire ce que vous recherchez",
      ai_search_error: "Impossible de comprendre votre recherche. Veuillez réessayer.",
      ai_search_example_1: "appartement moderne avec vue mer",
      ai_search_example_2: "villa familiale avec jardin moins de 400k",
      ai_search_example_3: "location 2 chambres près de la plage",
      view_details: "Voir les détails",
      card_view: "Voir les détails",
      detail_description: "Description",
      detail_features: "Caractéristiques",
      detail_contact: "Contacter l'agent",
      detail_location: "Emplacement",
      detail_related: "Propriétés similaires",
      detail_read_more: "Lire la suite",
      detail_read_less: "Réduire",
      detail_loading_map: "Chargement de la carte...",
      detail_view_larger_map: "Voir carte agrandie",
      detail_get_directions: "Itinéraire",
      wishlist_add: "Ajouter aux favoris",
      wishlist_remove: "Retirer des favoris",
      pagination_prev: "Précédent",
      pagination_next: "Suivant",
      general_close: "Fermer",
      general_clear: "Effacer",
      cancel: "Annuler",
      close: "Fermer",
      save: "Enregistrer",
      no_results: "Aucun résultat trouvé"
    },
    nl_NL: {
      // Search
      search_location: "Locatie",
      search_location_placeholder: "Zoek locatie...",
      search_sublocation: "Sublocatie",
      search_listing_type: "Status",
      search_listing_type_all: "Status",
      search_sale: "Verkoop",
      search_rent: "Huur",
      listing_type_sale: "Verkoop",
      listing_type_new: "Nieuwbouw",
      listing_type_long_rental: "Langetermijnhuur",
      listing_type_short_rental: "Vakantieverhuur",
      search_property_type: "Type woning",
      search_property_type_placeholder: "Elk type",
      search_bedrooms: "Slaapkamers",
      search_bedrooms_any: "Min. slaapk.",
      search_bedrooms_select: "Slaapkamers selecteren",
      search_bathrooms: "Badkamers",
      search_bathrooms_any: "Min. badk.",
      search_bathrooms_select: "Badkamers selecteren",
      search_price: "Prijs",
      search_price_min: "Min. prijs",
      search_price_max: "Max. prijs",
      search_price_select_min: "Min. prijs selecteren",
      search_price_select_max: "Max. prijs selecteren",
      search_built_area: "Bebouwde oppervlakte",
      search_plot_size: "Perceelgrootte",
      search_features: "Kenmerken",
      search_features_placeholder: "Kenmerken selecteren",
      search_features_filter: "Kenmerken zoeken...",
      search_reference: "Referentie",
      search_button: "Zoeken",
      search_reset: "Opnieuw instellen",
      search_any: "Alle",
      search_all: "Alle",
      search_min: "Min.",
      search_max: "Max.",
      // Results
      results_count: "{count} woningen gevonden",
      results_count_one: "1 woning gevonden",
      results_count_zero: "Geen woningen gevonden",
      results_sort: "Sorteren op",
      results_view_grid: "Raster",
      results_view_list: "Lijst",
      results_loading: "Laden...",
      // Sort
      sort_newest: "Nieuwste",
      sort_oldest: "Oudste",
      sort_updated: "Recent bijgewerkt",
      sort_oldest_updated: "Oudste bijgewerkt",
      sort_price_asc: "Prijs: laag naar hoog",
      sort_price_desc: "Prijs: hoog naar laag",
      sort_featured: "Uitgelicht eerst",
      sort_location: "Op locatie",
      sort_own: "Eigen woningen eerst",
      sort_by: "Sorteren op",
      sort_recent: "Recent toegevoegd",
      sort_name: "Naam: A-Z",
      // AI Search
      ai_search_title: "AI Zoeken",
      ai_search_back: "Terug naar filters",
      ai_search_placeholder: `Beschrijf je droomwoning...
bijv., villa met 3 slaapkamers en zwembad nabij strand onder 500k`,
      ai_search_try: "Probeer:",
      ai_search_button: "Zoeken",
      ai_search_empty: "Beschrijf wat je zoekt",
      ai_search_error: "Kon je zoekopdracht niet begrijpen. Probeer het opnieuw.",
      ai_search_example_1: "modern appartement met zeezicht",
      ai_search_example_2: "familievilla met tuin onder 400k",
      ai_search_example_3: "2 slaapkamer huurwoning nabij strand",
      // Card
      card_bed: "slaapk.",
      card_beds: "slaapk.",
      card_bath: "badk.",
      card_baths: "badk.",
      card_view: "Details bekijken",
      card_ref: "Ref:",
      // Detail
      detail_description: "Beschrijving",
      detail_features: "Kenmerken",
      detail_location: "Locatie",
      detail_contact: "Contact makelaar",
      detail_share: "Delen",
      detail_back: "Terug naar resultaten",
      detail_back_to_search: "Terug naar zoeken",
      detail_related: "Vergelijkbare woningen",
      detail_year_built: "Bouwjaar",
      detail_property_type: "Type woning",
      detail_status: "Status",
      detail_reference: "Referentie",
      detail_unique_ref: "Unieke referentie",
      detail_floor: "Verdieping",
      detail_orientation: "Oriëntatie",
      detail_condition: "Staat",
      detail_furnished: "Gemeubileerd",
      detail_views: "Uitzicht",
      detail_parking: "Parkeren",
      detail_built_area: "Bebouwde oppervlakte",
      detail_plot_size: "Perceelgrootte",
      detail_usable_area: "Bruikbare oppervlakte",
      detail_terrace: "Terras",
      detail_sizes: "Afmetingen",
      detail_property_info: "Woninginformatie",
      detail_taxes_fees: "Belastingen & kosten",
      detail_community_fees: "Servicekosten",
      detail_ibi_tax: "IBI belasting",
      detail_basura_tax: "Afvalbelasting",
      detail_per_month: "/maand",
      detail_per_year: "/jaar",
      detail_energy_certificate: "Energiecertificaat",
      detail_energy_rating: "Energielabel",
      detail_co2_rating: "CO2 classificatie",
      detail_video_tour: "Video tour",
      detail_virtual_tour: "Virtuele tour",
      detail_download_pdf: "PDF downloaden",
      detail_loading_map: "Kaart laden...",
      detail_read_more: "Lees meer",
      detail_read_less: "Lees minder",
      detail_price_on_request: "Prijs op aanvraag",
      detail_view_larger_map: "Grotere kaart bekijken",
      detail_get_directions: "Routebeschrijving",
      // Wishlist
      wishlist_add: "Toevoegen aan favorieten",
      wishlist_remove: "Verwijderen uit favorieten",
      wishlist_title: "Mijn verlanglijst",
      wishlist_empty: "Je verlanglijst is leeg",
      wishlist_empty_desc: "Voeg woningen toe door op het hartje te klikken",
      wishlist_share: "Delen",
      wishlist_email: "E-mail",
      wishlist_pdf: "PDF downloaden",
      wishlist_clear: "Alles wissen",
      wishlist_back: "Terug naar resultaten",
      wishlist_browse: "Woningen bekijken",
      wishlist_compare: "Vergelijken",
      wishlist_confirm_clear: "Weet je zeker dat je je hele verlanglijst wilt wissen?",
      wishlist_removed: "Verwijderd uit favorieten",
      wishlist_cleared: "Verlanglijst gewist",
      // Inquiry
      inquiry_name: "Uw naam",
      inquiry_first_name: "Voornaam",
      inquiry_last_name: "Achternaam",
      inquiry_email: "Uw e-mail",
      inquiry_phone: "Uw telefoon",
      inquiry_message: "Bericht",
      inquiry_submit: "Aanvraag versturen",
      inquiry_sending: "Verzenden...",
      inquiry_success: "Bedankt! Uw aanvraag is verstuurd.",
      inquiry_error: "Er is een fout opgetreden. Probeer het opnieuw.",
      inquiry_privacy_accept: "Ik accepteer het",
      inquiry_privacy_policy: "privacybeleid",
      inquiry_country: "Land",
      // Pagination
      pagination_prev: "Vorige",
      pagination_next: "Volgende",
      pagination_page: "Pagina",
      pagination_of: "van",
      pagination_load_more: "Meer laden",
      // General
      general_error: "Er is een fout opgetreden",
      general_retry: "Opnieuw proberen",
      general_close: "Sluiten",
      general_select: "Selecteren",
      general_selected: "Geselecteerd",
      general_clear: "Wissen",
      view_details: "Details bekijken",
      no_results: "Geen resultaten gevonden",
      compare: "Vergelijken",
      cancel: "Annuleren",
      close: "Sluiten",
      save: "Opslaan",
      delete: "Verwijderen",
      error: "Fout",
      property: "woning",
      properties: "woningen",
      featured: "Uitgelicht",
      own: "Eigen",
      price: "Prijs",
      location: "Locatie",
      type: "Type",
      bedrooms: "Slaapkamers",
      bathrooms: "Badkamers",
      build_size: "Bebouwd",
      plot_size: "Perceel",
      status: "Status",
      // Map
      map_precision_exact: "Exacte locatie",
      map_precision_zipcode: "Postcodegebied",
      map_precision_area: "Gebied"
    },
    pl_PL: {
      // Search
      search_location: "Lokalizacja",
      search_location_placeholder: "Szukaj lokalizacji...",
      search_sublocation: "Podlokalizacja",
      search_listing_type: "Status",
      search_listing_type_all: "Status",
      search_sale: "Sprzedaż",
      search_rent: "Wynajem",
      listing_type_sale: "Sprzedaż",
      listing_type_new: "Nowe inwestycje",
      listing_type_long_rental: "Wynajem długoterminowy",
      listing_type_short_rental: "Wynajem wakacyjny",
      search_property_type: "Typ nieruchomości",
      search_property_type_placeholder: "Dowolny typ",
      search_bedrooms: "Sypialnie",
      search_bedrooms_any: "Min. syp.",
      search_bedrooms_select: "Wybierz sypialnie",
      search_bathrooms: "Łazienki",
      search_bathrooms_any: "Min. łaz.",
      search_bathrooms_select: "Wybierz łazienki",
      search_price: "Cena",
      search_price_min: "Cena min.",
      search_price_max: "Cena maks.",
      search_price_select_min: "Wybierz cenę min.",
      search_price_select_max: "Wybierz cenę maks.",
      search_built_area: "Powierzchnia zabudowy",
      search_plot_size: "Powierzchnia działki",
      search_features: "Cechy",
      search_features_placeholder: "Wybierz cechy",
      search_features_filter: "Szukaj cech...",
      search_reference: "Referencja",
      search_button: "Szukaj",
      search_reset: "Resetuj",
      search_any: "Dowolny",
      search_all: "Wszystkie",
      search_min: "Min.",
      search_max: "Maks.",
      // Results
      results_count: "Znaleziono {count} nieruchomości",
      results_count_one: "Znaleziono 1 nieruchomość",
      results_count_zero: "Nie znaleziono nieruchomości",
      results_sort: "Sortuj według",
      results_view_grid: "Siatka",
      results_view_list: "Lista",
      results_loading: "Ładowanie...",
      // Sort
      sort_newest: "Najnowsze",
      sort_oldest: "Najstarsze",
      sort_updated: "Ostatnio zaktualizowane",
      sort_oldest_updated: "Najdawniej zaktualizowane",
      sort_price_asc: "Cena: rosnąco",
      sort_price_desc: "Cena: malejąco",
      sort_featured: "Wyróżnione",
      sort_location: "Wg lokalizacji",
      sort_own: "Własne nieruchomości najpierw",
      sort_by: "Sortuj według",
      sort_recent: "Ostatnio dodane",
      sort_name: "Nazwa: A-Z",
      // AI Search
      ai_search_title: "Wyszukiwanie AI",
      ai_search_back: "Powrót do filtrów",
      ai_search_placeholder: `Opisz swoją wymarzoną nieruchomość...
np., willa z 3 sypialniami z basenem blisko plaży poniżej 500k`,
      ai_search_try: "Spróbuj:",
      ai_search_button: "Szukaj",
      ai_search_empty: "Opisz czego szukasz",
      ai_search_error: "Nie udało się zrozumieć wyszukiwania. Spróbuj ponownie.",
      ai_search_example_1: "nowoczesne mieszkanie z widokiem na morze",
      ai_search_example_2: "rodzinna willa z ogrodem poniżej 400k",
      ai_search_example_3: "2 sypialnie do wynajęcia blisko plaży",
      // Card
      card_bed: "syp.",
      card_beds: "syp.",
      card_bath: "łaz.",
      card_baths: "łaz.",
      card_view: "Szczegóły",
      card_ref: "Ref:",
      // Detail
      detail_description: "Opis",
      detail_features: "Cechy",
      detail_location: "Lokalizacja",
      detail_contact: "Kontakt z agentem",
      detail_share: "Udostępnij",
      detail_back: "Powrót do wyników",
      detail_back_to_search: "Powrót do wyszukiwania",
      detail_related: "Podobne nieruchomości",
      detail_year_built: "Rok budowy",
      detail_property_type: "Typ nieruchomości",
      detail_status: "Status",
      detail_reference: "Referencja",
      detail_unique_ref: "Unikalna referencja",
      detail_floor: "Piętro",
      detail_orientation: "Orientacja",
      detail_condition: "Stan",
      detail_furnished: "Umeblowane",
      detail_views: "Widoki",
      detail_parking: "Parking",
      detail_built_area: "Powierzchnia zabudowy",
      detail_plot_size: "Powierzchnia działki",
      detail_usable_area: "Powierzchnia użytkowa",
      detail_terrace: "Taras",
      detail_sizes: "Wymiary nieruchomości",
      detail_property_info: "Informacje o nieruchomości",
      detail_taxes_fees: "Podatki i opłaty",
      detail_community_fees: "Opłaty wspólnoty",
      detail_ibi_tax: "Podatek IBI",
      detail_basura_tax: "Opłata za śmieci",
      detail_per_month: "/miesiąc",
      detail_per_year: "/rok",
      detail_energy_certificate: "Certyfikat energetyczny",
      detail_energy_rating: "Klasa energetyczna",
      detail_co2_rating: "Klasa CO2",
      detail_video_tour: "Wideo",
      detail_virtual_tour: "Wirtualny spacer",
      detail_download_pdf: "Pobierz PDF",
      detail_loading_map: "Ładowanie mapy...",
      detail_read_more: "Czytaj więcej",
      detail_read_less: "Czytaj mniej",
      detail_price_on_request: "Cena na zapytanie",
      detail_view_larger_map: "Powiększ mapę",
      detail_get_directions: "Wyznacz trasę",
      // Wishlist
      wishlist_add: "Dodaj do ulubionych",
      wishlist_remove: "Usuń z ulubionych",
      wishlist_title: "Moja lista życzeń",
      wishlist_empty: "Twoja lista życzeń jest pusta",
      wishlist_empty_desc: "Dodaj nieruchomości klikając ikonę serca",
      wishlist_share: "Udostępnij",
      wishlist_email: "E-mail",
      wishlist_pdf: "Pobierz PDF",
      wishlist_clear: "Wyczyść wszystko",
      wishlist_back: "Powrót do wyników",
      wishlist_browse: "Przeglądaj nieruchomości",
      wishlist_compare: "Porównaj",
      wishlist_confirm_clear: "Czy na pewno chcesz wyczyścić całą listę życzeń?",
      wishlist_removed: "Usunięto z ulubionych",
      wishlist_cleared: "Lista życzeń wyczyszczona",
      // Inquiry
      inquiry_name: "Twoje imię",
      inquiry_first_name: "Imię",
      inquiry_last_name: "Nazwisko",
      inquiry_email: "Twój e-mail",
      inquiry_phone: "Twój telefon",
      inquiry_message: "Wiadomość",
      inquiry_submit: "Wyślij zapytanie",
      inquiry_sending: "Wysyłanie...",
      inquiry_success: "Dziękujemy! Twoje zapytanie zostało wysłane.",
      inquiry_error: "Przepraszamy, wystąpił błąd. Spróbuj ponownie.",
      inquiry_privacy_accept: "Akceptuję",
      inquiry_privacy_policy: "politykę prywatności",
      inquiry_country: "Kraj",
      // Pagination
      pagination_prev: "Poprzednia",
      pagination_next: "Następna",
      pagination_page: "Strona",
      pagination_of: "z",
      pagination_load_more: "Załaduj więcej",
      // General
      general_error: "Wystąpił błąd",
      general_retry: "Spróbuj ponownie",
      general_close: "Zamknij",
      general_select: "Wybierz",
      general_selected: "Wybrano",
      general_clear: "Wyczyść",
      view_details: "Szczegóły",
      no_results: "Nie znaleziono wyników",
      compare: "Porównaj",
      cancel: "Anuluj",
      close: "Zamknij",
      save: "Zapisz",
      delete: "Usuń",
      error: "Błąd",
      property: "nieruchomość",
      properties: "nieruchomości",
      featured: "Wyróżnione",
      own: "Własne",
      price: "Cena",
      location: "Lokalizacja",
      type: "Typ",
      bedrooms: "Sypialnie",
      bathrooms: "Łazienki",
      build_size: "Zabudowa",
      plot_size: "Działka",
      status: "Status",
      // Map
      map_precision_exact: "Dokładna lokalizacja",
      map_precision_zipcode: "Kod pocztowy",
      map_precision_area: "Obszar"
    },
    it_IT: {
      // AI Search
      ai_search_title: "Ricerca IA",
      ai_search_back: "Torna ai filtri",
      ai_search_placeholder: `Descrivi la tua proprietà ideale...
es., villa 3 camere con piscina vicino alla spiaggia sotto 500k`,
      ai_search_try: "Prova:",
      ai_search_button: "Cerca",
      ai_search_empty: "Descrivi cosa stai cercando",
      ai_search_error: "Impossibile comprendere la ricerca. Riprova.",
      ai_search_example_1: "appartamento moderno con vista mare",
      ai_search_example_2: "villa familiare con giardino sotto 400k",
      ai_search_example_3: "affitto 2 camere vicino alla spiaggia",
      // Sort
      sort_newest: "Più recenti",
      sort_oldest: "Più vecchi",
      sort_updated: "Aggiornati di recente",
      sort_oldest_updated: "Aggiornati meno recenti",
      sort_price_asc: "Prezzo: crescente",
      sort_price_desc: "Prezzo: decrescente",
      sort_featured: "In evidenza",
      sort_location: "Per posizione",
      sort_own: "Nostre proprietà prima",
      sort_recent: "Aggiunti di recente",
      sort_name: "Nome: A-Z",
      results_sort: "Ordina per",
      search_button: "Cerca",
      // Detail page
      detail_location: "Posizione",
      detail_related: "Proprietà simili",
      detail_read_more: "Leggi di più",
      detail_read_less: "Leggi meno",
      detail_loading_map: "Caricamento mappa...",
      detail_view_larger_map: "Visualizza mappa più grande",
      detail_get_directions: "Indicazioni stradali",
      wishlist_add: "Aggiungi ai preferiti",
      wishlist_remove: "Rimuovi dai preferiti",
      pagination_prev: "Precedente",
      pagination_next: "Successivo"
    },
    pt_PT: {
      // AI Search
      ai_search_title: "Pesquisa IA",
      ai_search_back: "Voltar aos filtros",
      ai_search_placeholder: `Descreva o seu imóvel ideal...
ex., moradia T3 com piscina perto da praia menos de 500k`,
      ai_search_try: "Experimente:",
      ai_search_button: "Pesquisar",
      ai_search_empty: "Descreva o que procura",
      ai_search_error: "Não foi possível entender a pesquisa. Tente novamente.",
      ai_search_example_1: "apartamento moderno com vista mar",
      ai_search_example_2: "moradia familiar com jardim menos de 400k",
      ai_search_example_3: "arrendamento T2 perto da praia",
      // Sort
      sort_newest: "Mais recentes",
      sort_oldest: "Mais antigos",
      sort_updated: "Atualizados recentemente",
      sort_price_asc: "Preço: crescente",
      sort_price_desc: "Preço: decrescente",
      sort_featured: "Em destaque",
      sort_location: "Por localização",
      sort_recent: "Adicionados recentemente",
      sort_name: "Nome: A-Z",
      results_sort: "Ordenar por",
      search_button: "Pesquisar",
      // Detail page
      detail_location: "Localização",
      detail_related: "Imóveis semelhantes",
      detail_read_more: "Ler mais",
      detail_read_less: "Ler menos",
      detail_loading_map: "A carregar mapa...",
      detail_view_larger_map: "Ver mapa maior",
      detail_get_directions: "Obter direções",
      wishlist_add: "Adicionar aos favoritos",
      wishlist_remove: "Remover dos favoritos",
      pagination_prev: "Anterior",
      pagination_next: "Seguinte"
    },
    ru_RU: {
      // AI Search
      ai_search_title: "ИИ Поиск",
      ai_search_back: "Назад к фильтрам",
      ai_search_placeholder: `Опишите вашу идеальную недвижимость...
напр., вилла с 3 спальнями и бассейном у пляжа до 500k`,
      ai_search_try: "Попробуйте:",
      ai_search_button: "Искать",
      ai_search_empty: "Опишите, что вы ищете",
      ai_search_error: "Не удалось понять запрос. Попробуйте снова.",
      ai_search_example_1: "современная квартира с видом на море",
      ai_search_example_2: "семейная вилла с садом до 400k",
      ai_search_example_3: "аренда 2 спальни у пляжа",
      // Sort
      sort_newest: "Новейшие",
      sort_oldest: "Старейшие",
      sort_updated: "Недавно обновленные",
      sort_price_asc: "Цена: по возрастанию",
      sort_price_desc: "Цена: по убыванию",
      sort_featured: "Рекомендуемые",
      sort_location: "По расположению",
      sort_recent: "Недавно добавленные",
      sort_name: "Название: А-Я",
      results_sort: "Сортировать",
      search_button: "Поиск",
      // Detail page
      detail_location: "Расположение",
      detail_related: "Похожие объекты",
      detail_read_more: "Читать далее",
      detail_read_less: "Свернуть",
      detail_loading_map: "Загрузка карты...",
      detail_view_larger_map: "Увеличить карту",
      detail_get_directions: "Проложить маршрут",
      wishlist_add: "Добавить в избранное",
      wishlist_remove: "Удалить из избранного",
      pagination_prev: "Назад",
      pagination_next: "Далее"
    },
    zh_CN: {
      // AI Search
      ai_search_title: "AI搜索",
      ai_search_back: "返回筛选",
      ai_search_placeholder: `描述您理想的房产...
例如：3卧室海滨别墅带泳池，50万以下`,
      ai_search_try: "试试：",
      ai_search_button: "搜索",
      ai_search_empty: "请描述您要找的内容",
      ai_search_error: "无法理解您的搜索，请重试。",
      ai_search_example_1: "现代海景公寓",
      ai_search_example_2: "带花园的家庭别墅40万以下",
      ai_search_example_3: "海滩附近2卧室出租",
      // Sort
      sort_newest: "最新",
      sort_oldest: "最旧",
      sort_updated: "最近更新",
      sort_price_asc: "价格：从低到高",
      sort_price_desc: "价格：从高到低",
      sort_featured: "精选优先",
      sort_location: "按位置",
      sort_recent: "最近添加",
      sort_name: "名称: A-Z",
      results_sort: "排序",
      search_button: "搜索",
      // Detail page
      detail_location: "位置",
      detail_related: "相似房产",
      detail_read_more: "阅读更多",
      detail_read_less: "收起",
      detail_loading_map: "加载地图中...",
      detail_view_larger_map: "查看大地图",
      detail_get_directions: "获取路线",
      wishlist_add: "添加到收藏夹",
      wishlist_remove: "从收藏夹移除",
      pagination_prev: "上一页",
      pagination_next: "下一页"
    },
    ja_JP: {
      // AI Search
      ai_search_title: "AI検索",
      ai_search_back: "フィルターに戻る",
      ai_search_placeholder: `理想の物件を説明してください...
例：ビーチ近く、プール付き3ベッドルームヴィラ、50万以下`,
      ai_search_try: "試す：",
      ai_search_button: "検索",
      ai_search_empty: "探しているものを説明してください",
      ai_search_error: "検索を理解できませんでした。もう一度お試しください。",
      ai_search_example_1: "海の見えるモダンアパートメント",
      ai_search_example_2: "庭付きファミリーヴィラ40万以下",
      ai_search_example_3: "ビーチ近くの2ベッドルーム賃貸",
      // Sort
      sort_newest: "新着順",
      sort_oldest: "古い順",
      sort_updated: "更新順",
      sort_price_asc: "価格：安い順",
      sort_price_desc: "価格：高い順",
      sort_featured: "おすすめ",
      sort_location: "場所順",
      sort_recent: "最近追加",
      sort_name: "名前: A-Z",
      results_sort: "並び替え",
      search_button: "検索",
      // Detail page
      detail_location: "所在地",
      detail_related: "類似物件",
      detail_read_more: "続きを読む",
      detail_read_less: "閉じる",
      detail_loading_map: "地図を読み込み中...",
      detail_view_larger_map: "大きな地図で見る",
      detail_get_directions: "道順を調べる",
      wishlist_add: "お気に入りに追加",
      wishlist_remove: "お気に入りから削除",
      pagination_prev: "前へ",
      pagination_next: "次へ"
    },
    ar_SA: {
      // AI Search
      ai_search_title: "بحث بالذكاء الاصطناعي",
      ai_search_back: "العودة للفلاتر",
      ai_search_placeholder: `صف عقارك المثالي...
مثال: فيلا 3 غرف نوم مع مسبح قرب الشاطئ أقل من 500 ألف`,
      ai_search_try: "جرب:",
      ai_search_button: "بحث",
      ai_search_empty: "صف ما تبحث عنه",
      ai_search_error: "لم نتمكن من فهم بحثك. حاول مرة أخرى.",
      ai_search_example_1: "شقة حديثة مع إطلالة بحرية",
      ai_search_example_2: "فيلا عائلية مع حديقة أقل من 400 ألف",
      ai_search_example_3: "إيجار غرفتين قرب الشاطئ",
      // Sort
      sort_newest: "الأحدث",
      sort_oldest: "الأقدم",
      sort_updated: "المحدثة مؤخراً",
      sort_price_asc: "السعر: من الأقل",
      sort_price_desc: "السعر: من الأعلى",
      sort_featured: "المميزة أولاً",
      sort_location: "حسب الموقع",
      sort_recent: "المضافة حديثاً",
      sort_name: "الاسم: أ-ي",
      results_sort: "ترتيب حسب",
      search_button: "بحث",
      // Detail page
      detail_location: "الموقع",
      detail_related: "عقارات مشابهة",
      detail_read_more: "اقرأ المزيد",
      detail_read_less: "اقرأ أقل",
      detail_loading_map: "جاري تحميل الخريطة...",
      detail_view_larger_map: "عرض خريطة أكبر",
      detail_get_directions: "الحصول على الاتجاهات",
      wishlist_add: "إضافة إلى المفضلة",
      wishlist_remove: "إزالة من المفضلة",
      pagination_prev: "السابق",
      pagination_next: "التالي"
    },
    sv_SE: {
      // AI Search
      ai_search_title: "AI-sökning",
      ai_search_back: "Tillbaka till filter",
      ai_search_placeholder: `Beskriv din drömbostad...
t.ex., 3 sovrum villa med pool nära stranden under 500k`,
      ai_search_try: "Prova:",
      ai_search_button: "Sök",
      ai_search_empty: "Beskriv vad du letar efter",
      ai_search_error: "Kunde inte förstå din sökning. Försök igen.",
      ai_search_example_1: "modern lägenhet med havsutsikt",
      ai_search_example_2: "familjevilla med trädgård under 400k",
      ai_search_example_3: "2 sovrum hyra nära stranden",
      // Sort
      sort_newest: "Nyaste",
      sort_oldest: "Äldsta",
      sort_updated: "Senast uppdaterade",
      sort_price_asc: "Pris: lägst först",
      sort_price_desc: "Pris: högst först",
      sort_featured: "Utvalda först",
      sort_location: "Efter plats",
      sort_recent: "Nyligen tillagda",
      sort_name: "Namn: A-Ö",
      results_sort: "Sortera efter",
      search_button: "Sök",
      // Detail page
      detail_location: "Plats",
      detail_related: "Liknande fastigheter",
      detail_read_more: "Läs mer",
      detail_read_less: "Läs mindre",
      detail_loading_map: "Laddar karta...",
      detail_view_larger_map: "Visa större karta",
      detail_get_directions: "Vägbeskrivning",
      wishlist_add: "Lägg till i favoriter",
      wishlist_remove: "Ta bort från favoriter",
      pagination_prev: "Föregående",
      pagination_next: "Nästa"
    },
    no_NO: {
      // AI Search
      ai_search_title: "AI-søk",
      ai_search_back: "Tilbake til filtre",
      ai_search_placeholder: `Beskriv din drømmebolig...
f.eks., 3 soverom villa med basseng nær stranden under 500k`,
      ai_search_try: "Prøv:",
      ai_search_button: "Søk",
      ai_search_empty: "Beskriv hva du leter etter",
      ai_search_error: "Kunne ikke forstå søket ditt. Prøv igjen.",
      ai_search_example_1: "moderne leilighet med havutsikt",
      ai_search_example_2: "familievilla med hage under 400k",
      ai_search_example_3: "2 soverom leie nær stranden",
      // Sort
      sort_newest: "Nyeste",
      sort_oldest: "Eldste",
      sort_updated: "Sist oppdatert",
      sort_price_asc: "Pris: lavest først",
      sort_price_desc: "Pris: høyest først",
      sort_featured: "Utvalgte først",
      sort_location: "Etter sted",
      sort_recent: "Nylig lagt til",
      sort_name: "Navn: A-Å",
      results_sort: "Sorter etter",
      search_button: "Søk",
      // Detail page
      detail_location: "Beliggenhet",
      detail_related: "Lignende eiendommer",
      detail_read_more: "Les mer",
      detail_read_less: "Les mindre",
      detail_loading_map: "Laster kart...",
      detail_view_larger_map: "Vis større kart",
      detail_get_directions: "Veibeskrivelse",
      wishlist_add: "Legg til i favoritter",
      wishlist_remove: "Fjern fra favoritter",
      pagination_prev: "Forrige",
      pagination_next: "Neste"
    },
    da_DK: {
      // AI Search
      ai_search_title: "AI-søgning",
      ai_search_back: "Tilbage til filtre",
      ai_search_placeholder: `Beskriv din drømmebolig...
f.eks., 3 værelses villa med pool nær stranden under 500k`,
      ai_search_try: "Prøv:",
      ai_search_button: "Søg",
      ai_search_empty: "Beskriv hvad du leder efter",
      ai_search_error: "Kunne ikke forstå din søgning. Prøv igen.",
      ai_search_example_1: "moderne lejlighed med havudsigt",
      ai_search_example_2: "familievilla med have under 400k",
      ai_search_example_3: "2 værelses leje nær stranden",
      // Sort
      sort_newest: "Nyeste",
      sort_oldest: "Ældste",
      sort_updated: "Sidst opdateret",
      sort_price_asc: "Pris: lavest først",
      sort_price_desc: "Pris: højest først",
      sort_featured: "Fremhævede først",
      sort_location: "Efter placering",
      sort_recent: "Senest tilføjet",
      sort_name: "Navn: A-Å",
      results_sort: "Sortér efter",
      search_button: "Søg",
      // Detail page
      detail_location: "Beliggenhed",
      detail_related: "Lignende ejendomme",
      detail_read_more: "Læs mere",
      detail_read_less: "Læs mindre",
      detail_loading_map: "Indlæser kort...",
      detail_view_larger_map: "Vis større kort",
      detail_get_directions: "Rutevejledning",
      wishlist_add: "Tilføj til favoritter",
      wishlist_remove: "Fjern fra favoritter",
      pagination_prev: "Forrige",
      pagination_next: "Næste"
    },
    fi_FI: {
      // AI Search
      ai_search_title: "Tekoälyhaku",
      ai_search_back: "Takaisin suodattimiin",
      ai_search_placeholder: `Kuvaile unelma-asuntoasi...
esim., 3 makuuhuoneen huvila uima-altaalla rannan lähellä alle 500k`,
      ai_search_try: "Kokeile:",
      ai_search_button: "Hae",
      ai_search_empty: "Kuvaile mitä etsit",
      ai_search_error: "Hakua ei voitu ymmärtää. Yritä uudelleen.",
      ai_search_example_1: "moderni asunto merinäköalalla",
      ai_search_example_2: "perhehuvila puutarhalla alle 400k",
      ai_search_example_3: "2 makuuhuoneen vuokra rannan lähellä",
      // Sort
      sort_newest: "Uusimmat",
      sort_oldest: "Vanhimmat",
      sort_updated: "Viimeksi päivitetyt",
      sort_price_asc: "Hinta: halvin ensin",
      sort_price_desc: "Hinta: kallein ensin",
      sort_featured: "Suositellut ensin",
      sort_location: "Sijainnin mukaan",
      sort_recent: "Viimeksi lisätyt",
      sort_name: "Nimi: A-Ö",
      results_sort: "Järjestä",
      search_button: "Hae",
      // Detail page
      detail_location: "Sijainti",
      detail_related: "Samankaltaiset kohteet",
      detail_read_more: "Lue lisää",
      detail_read_less: "Näytä vähemmän",
      detail_loading_map: "Ladataan karttaa...",
      detail_view_larger_map: "Näytä suurempi kartta",
      detail_get_directions: "Reittiohjeet",
      wishlist_add: "Lisää suosikkeihin",
      wishlist_remove: "Poista suosikeista",
      pagination_prev: "Edellinen",
      pagination_next: "Seuraava"
    }
  };
  let e = { ..._ }, t = "en_US";
  const s = {
    en: "en_US",
    es: "es_ES",
    de: "de_DE",
    fr: "fr_FR",
    it: "it_IT",
    pt: "pt_PT",
    nl: "nl_NL",
    ru: "ru_RU",
    zh: "zh_CN",
    ja: "ja_JP",
    ar: "ar_SA",
    sv: "sv_SE",
    no: "no_NO",
    da: "da_DK",
    fi: "fi_FI",
    pl: "pl_PL"
  };
  function i() {
    let u = navigator.language || navigator.userLanguage;
    if (u) {
      if (u = u.replace("-", "_"), u.includes("_"))
        return u;
      if (s[u.toLowerCase()])
        return s[u.toLowerCase()];
    }
    const b = document.documentElement.lang;
    if (b) {
      const M = b.split("-")[0].toLowerCase();
      if (s[M])
        return s[M];
    }
    return "en_US";
  }
  function r(u = null) {
    return t = u || i(), t;
  }
  async function a(u) {
    const b = n[t] || {}, M = Object.keys(b).length;
    if (u && typeof u == "object") {
      const z = Object.keys(u).length;
      console.log(
        "[RealtySoft Labels] Loading",
        z,
        "API labels +",
        M,
        "language defaults for:",
        t
      ), e = { ..._, ...u, ...b };
    } else
      console.log("[RealtySoft Labels] No API labels, using defaults +", M, "language defaults"), e = { ..._, ...b };
  }
  function l(u) {
    if (u && typeof u == "object") {
      const b = Object.keys(u).length;
      console.log("[RealtySoft Labels] Applying", b, "client label overrides"), e = { ...e, ...u };
    }
  }
  async function d(u) {
    console.log("[RealtySoft Labels] Reloading labels for language:", u), t = u;
    const b = n[u] || {};
    e = { ..._, ...b };
  }
  function y(u, b = {}) {
    let M = e[u] || _[u] || u;
    for (const [z, W] of Object.entries(b))
      M = M.replace(new RegExp(`\\{${z}\\}`, "g"), String(W));
    return M;
  }
  function p() {
    return { ...e };
  }
  function S() {
    return t;
  }
  function C(u) {
    t = u;
  }
  function k(u, b = "EUR") {
    if (u == null) return "";
    try {
      const M = t.replace("_", "-");
      return new Intl.NumberFormat(M, {
        style: "currency",
        currency: b,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(u);
    } catch {
      return `€${u.toLocaleString()}`;
    }
  }
  function L(u) {
    if (u == null) return "";
    try {
      const b = t.replace("_", "-");
      return new Intl.NumberFormat(b).format(u);
    } catch {
      return u.toLocaleString();
    }
  }
  function f(u) {
    return u ? `${L(u)} m²` : "";
  }
  return {
    init: r,
    loadFromAPI: a,
    applyOverrides: l,
    reloadForLanguage: d,
    get: y,
    getAll: p,
    getLanguage: S,
    setLanguage: C,
    detectLanguage: i,
    formatPrice: k,
    formatNumber: L,
    formatArea: f
  };
}();
typeof window < "u" && (window.RealtySoftLabels = pe);
const ue = /* @__PURE__ */ function() {
  const _ = {
    enabled: !0,
    endpoint: null,
    batchSize: 5,
    batchDelay: 3e3,
    debug: !0
  };
  function n() {
    try {
      const E = document.querySelectorAll('script[src*="realtysoft"]');
      for (let N = 0; N < E.length; N++) {
        const K = E[N].src, ie = K.indexOf("/propertymanager/");
        if (ie !== -1)
          return K.substring(0, ie) + "/propertymanager/php/analytics-track.php";
      }
    } catch (E) {
      console.error("[RealtySoft] Analytics detectEndpoint error:", E);
    }
    return "https://realtysoft.ai/propertymanager/php/analytics-track.php";
  }
  let e = [], t = null;
  function s(E) {
    E && (E.enabled !== void 0 && (_.enabled = E.enabled), E.endpoint !== void 0 && (_.endpoint = E.endpoint), E.batchSize !== void 0 && (_.batchSize = E.batchSize), E.batchDelay !== void 0 && (_.batchDelay = E.batchDelay), E.debug !== void 0 && (_.debug = E.debug)), _.endpoint || (_.endpoint = n()), console.log("[RealtySoft] Analytics initialized, endpoint:", _.endpoint), window.addEventListener("beforeunload", a), document.addEventListener("visibilitychange", function() {
      document.visibilityState === "hidden" && a();
    });
  }
  function i(E, N, K = {}) {
    if (!_.enabled) return;
    const ie = {
      category: E,
      action: N,
      data: K,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      sessionId: l()
    };
    _.debug && console.log("[RealtySoft] Analytics Event:", E, N), e.push(ie), e.length >= _.batchSize ? a() : r();
  }
  function r() {
    t || (t = setTimeout(function() {
      a(), t = null;
    }, _.batchDelay));
  }
  function a() {
    if (e.length === 0) return;
    const E = e.slice();
    e = [], console.log(
      "[RealtySoft] Analytics: Sending",
      E.length,
      "events to",
      _.endpoint
    ), _.endpoint && fetch(_.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events: E }),
      keepalive: !0
    }).then(function(N) {
      return console.log("[RealtySoft] Analytics response:", N.status), N.json();
    }).then(function(N) {
      console.log("[RealtySoft] Analytics result:", N);
    }).catch(function(N) {
      console.error("[RealtySoft] Analytics send failed:", N);
    });
  }
  function l() {
    let E = sessionStorage.getItem("rs_session_id");
    return E || (E = "rs_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9), sessionStorage.setItem("rs_session_id", E)), E;
  }
  function d(E = {}) {
    i("search", "search", {
      location: E.location,
      listing_type: E.listingType,
      property_type: E.propertyType,
      beds_min: E.bedsMin,
      beds_max: E.bedsMax,
      price_min: E.priceMin,
      price_max: E.priceMax,
      features: E.features
    });
  }
  function y(E = {}) {
    i("view", "property_view", {
      property_id: E.id,
      property_ref: E.ref,
      property_type: E.type,
      location: E.location,
      price: E.price
    });
  }
  function p(E = {}) {
    i("click", "card_click", {
      property_id: E.id,
      property_ref: E.ref
    });
  }
  function S(E, N) {
    i("view", "gallery_view", {
      property_id: E,
      image_index: N
    });
  }
  function C(E) {
    i("wishlist", "add", {
      property_id: E
    });
  }
  function k(E) {
    i("wishlist", "remove", {
      property_id: E
    });
  }
  function L(E = []) {
    i("wishlist", "view", {
      property_ids: E,
      count: E.length
    });
  }
  function f(E) {
    i("wishlist", "share", {
      method: E
    });
  }
  function u(E, N) {
    i("inquiry", "submit", {
      property_id: E,
      property_ref: N
    });
  }
  function b(E, N) {
    i("click", "share", {
      platform: E,
      property_id: N
    });
  }
  function M(E, N) {
    i("click", "link", {
      link_type: E,
      url: N
    });
  }
  function z(E, N) {
    i("search", "filter_change", {
      filter: E,
      value: N
    });
  }
  function W(E, N) {
    i("click", "pagination", {
      page: E,
      total_pages: N
    });
  }
  function G(E) {
    i("click", "sort", {
      sort: E
    });
  }
  function U(E) {
    i("click", "view_toggle", {
      view: E
    });
  }
  function te(E, N) {
    i("click", "resource", {
      resource_type: E,
      property_id: N
    });
  }
  return {
    init: s,
    track: i,
    flush: a,
    trackSearch: d,
    trackPropertyView: y,
    trackCardClick: p,
    trackGalleryView: S,
    trackWishlistAdd: C,
    trackWishlistRemove: k,
    trackWishlistView: L,
    trackWishlistShare: f,
    trackInquiry: u,
    trackShare: b,
    trackLinkClick: M,
    trackFilterChange: z,
    trackPagination: W,
    trackSortChange: G,
    trackViewToggle: U,
    trackResourceClick: te
  };
}();
typeof window < "u" && (window.RealtySoftAnalytics = ue);
const Ze = /* @__PURE__ */ function() {
  let _ = null, n = [], e = 0;
  const t = {
    duration: 4e3,
    position: "bottom-right",
    closable: !0,
    pauseOnHover: !0
  };
  function s() {
    _ || (_ = document.createElement("div"), _.className = "rs-toast-container rs-toast-container--bottom-right", document.body.appendChild(_));
  }
  function i(L) {
    _ || s(), _ && (_.className = `rs-toast-container rs-toast-container--${L}`);
  }
  function r(L, f = "info", u = {}) {
    _ || s();
    const b = { ...t, ...u }, M = ++e, z = document.createElement("div");
    z.className = `rs-toast rs-toast--${f}`, z.dataset.toastId = String(M);
    const W = C(f);
    z.innerHTML = `
      <div class="rs-toast__icon">${W}</div>
      <div class="rs-toast__content">
        <span class="rs-toast__message">${k(L)}</span>
      </div>
      ${b.closable ? `
        <button type="button" class="rs-toast__close" aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      ` : ""}
      <div class="rs-toast__progress"></div>
    `;
    const G = z.querySelector(".rs-toast__progress");
    if (G && (G.style.animationDuration = `${b.duration}ms`), b.closable) {
      const K = z.querySelector(".rs-toast__close");
      K && K.addEventListener("click", () => {
        a(M);
      });
    }
    let U = null, te = b.duration, E = Date.now();
    b.pauseOnHover && (z.addEventListener("mouseenter", () => {
      te -= Date.now() - E, U && clearTimeout(U), G && (G.style.animationPlayState = "paused");
    }), z.addEventListener("mouseleave", () => {
      E = Date.now(), U = setTimeout(() => a(M), te), G && (G.style.animationPlayState = "running");
    })), _ && _.appendChild(z), requestAnimationFrame(() => {
      z.classList.add("rs-toast--visible");
    }), n.push({ id: M, element: z, timeoutId: null }), U = setTimeout(() => a(M), b.duration);
    const N = n.find((K) => K.id === M);
    return N && (N.timeoutId = U), M;
  }
  function a(L) {
    const f = n.find((b) => b.id === L);
    if (!f) return;
    f.timeoutId && clearTimeout(f.timeoutId);
    const u = f.element;
    u.classList.remove("rs-toast--visible"), u.classList.add("rs-toast--hiding"), setTimeout(() => {
      u.remove(), n = n.filter((b) => b.id !== L);
    }, 300);
  }
  function l() {
    n.forEach((L) => a(L.id));
  }
  function d(L, f) {
    return r(L, "success", f);
  }
  function y(L, f) {
    return r(L, "error", f);
  }
  function p(L, f) {
    return r(L, "warning", f);
  }
  function S(L, f) {
    return r(L, "info", f);
  }
  function C(L) {
    const f = {
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
      error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
      warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
      info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
    };
    return f[L] || f.info;
  }
  function k(L) {
    if (!L) return "";
    const f = document.createElement("div");
    return f.textContent = L, f.innerHTML;
  }
  return {
    init: s,
    setPosition: i,
    show: r,
    dismiss: a,
    dismissAll: l,
    success: d,
    error: y,
    warning: p,
    info: S
  };
}();
typeof window < "u" && (window.RealtySoftToast = Ze);
const I = function() {
  const _ = "realtysoft_wishlist", n = {
    CHANGED: "wishlistChanged",
    SORTED: "wishlistSorted",
    COMPARE_CHANGED: "wishlistCompareChanged",
    MODAL_OPEN: "wishlistModalOpen",
    MODAL_CLOSE: "wishlistModalClose"
  };
  let e = /* @__PURE__ */ new Set();
  const t = 3, s = {
    field: "addedAt",
    order: "desc"
  };
  function i() {
    try {
      const w = localStorage.getItem(_);
      return w ? JSON.parse(w) : {};
    } catch (w) {
      return console.error("[Wishlist] Error reading wishlist:", w), {};
    }
  }
  function r(w) {
    try {
      return localStorage.setItem(_, JSON.stringify(w)), !0;
    } catch (T) {
      return console.error("[Wishlist] Error saving wishlist:", T), !1;
    }
  }
  function a(w) {
    const T = i();
    return Object.prototype.hasOwnProperty.call(T, String(w));
  }
  function l(w) {
    var P, R;
    const T = i(), O = w.ref_no || w.ref || String(w.id), h = w.images || [];
    let g = "";
    if (h.length > 0) {
      const q = h[0];
      g = typeof q == "string" ? q : (q == null ? void 0 : q.url) || (q == null ? void 0 : q.src) || "";
    }
    const m = w.total_images || w.image_count || h.length || 0, v = {
      id: w.id,
      ref_no: O,
      title: w.title || w.name || "Property",
      price: w.price || w.list_price || 0,
      location: w.location || ((P = w.location_id) == null ? void 0 : P.name) || "N/A",
      type: w.type || ((R = w.type_id) == null ? void 0 : R.name) || "N/A",
      beds: w.beds || w.bedrooms || 0,
      baths: w.baths || w.bathrooms || 0,
      built: w.built || w.build_size || w.built_area || 0,
      plot: w.plot || w.plot_size || 0,
      image: g,
      image_count: m,
      listing_type: w.listing_type || w.status || "resale",
      is_featured: w.is_featured || !1,
      addedAt: Date.now(),
      note: ""
    };
    return T[O] = v, r(T) ? (z("added", T[O]), !0) : (console.error(
      "[Wishlist] Storage quota exceeded. Consider clearing old items."
    ), !1);
  }
  function d(w) {
    const T = i(), O = T[String(w)];
    return O && (delete T[String(w)], r(T)) ? (z("removed", O), !0) : !1;
  }
  function y(w) {
    const T = w.ref_no || w.ref || String(w.id);
    return a(T) ? { action: "removed", success: d(T) } : { action: "added", success: l(w) };
  }
  function p() {
    return Object.keys(i()).length;
  }
  function S(w) {
    return i()[String(w)] || null;
  }
  function C(w, T) {
    const O = i();
    return O[String(w)] && (O[String(w)].note = T, O[String(w)].updatedAt = Date.now(), r(O)) ? (z("noteUpdated", O[String(w)]), !0) : !1;
  }
  function k() {
    return localStorage.removeItem(_), z("cleared", null), !0;
  }
  function L(w = "addedAt", T = "desc") {
    const O = i(), h = Object.values(O);
    return h.sort((g, m) => {
      const v = g, P = m;
      let R = v[w], q = P[w];
      R == null && (R = ""), q == null && (q = "");
      let B, H;
      return typeof R == "string" ? (B = R.toLowerCase(), H = String(q || "").toLowerCase()) : typeof R == "number" ? (B = R, H = typeof q == "number" ? q : 0) : (B = String(R), H = String(q)), T === "asc" ? B > H ? 1 : B < H ? -1 : 0 : B < H ? 1 : B > H ? -1 : 0;
    }), h;
  }
  function f() {
    return Object.keys(i());
  }
  function u() {
    const w = f();
    if (w.length === 0)
      return null;
    const T = btoa(w.join(","));
    return `${window.location.origin}${window.location.pathname}?shared=${T}`;
  }
  function b() {
    const T = new URLSearchParams(window.location.search).get("shared");
    if (T)
      try {
        return atob(T).split(",").filter((h) => h.trim());
      } catch (O) {
        return console.error("[Wishlist] Error decoding shared link:", O), null;
      }
    return null;
  }
  function M() {
    const w = i(), T = JSON.stringify(w, null, 2), O = new Blob([T], { type: "application/json" }), h = URL.createObjectURL(O), g = document.createElement("a");
    g.href = h, g.download = `wishlist_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json`, g.click(), URL.revokeObjectURL(h);
  }
  function z(w, T) {
    try {
      const O = new CustomEvent(n.CHANGED, {
        detail: { action: w, property: T, count: p() }
      });
      window.dispatchEvent(O);
    } catch (O) {
      console.warn("[Wishlist] Event dispatch error:", O);
    }
    try {
      typeof RealtySoftState < "u" && RealtySoftState && RealtySoftState.set("wishlist", f());
    } catch (O) {
      console.warn("[Wishlist] State sync error:", O);
    }
  }
  function W() {
    return e;
  }
  function G(w) {
    e = new Set(w), c();
  }
  function U(w) {
    return e.size >= t ? !1 : (e.add(String(w)), c(), !0);
  }
  function te(w) {
    e.delete(String(w)), c();
  }
  function E(w) {
    const T = String(w);
    return e.has(T) ? (e.delete(T), c(), { success: !0, action: "removed" }) : e.size >= t ? { success: !1, action: "max_reached" } : (e.add(T), c(), { success: !0, action: "added" });
  }
  function N(w) {
    return e.has(String(w));
  }
  function K() {
    e.clear(), c();
  }
  function ie() {
    return e.size;
  }
  function X() {
    return t;
  }
  function ce() {
    return Array.from(e).map((w) => S(w)).filter((w) => w !== null);
  }
  function c() {
    const w = new CustomEvent(n.COMPARE_CHANGED, {
      detail: {
        selected: Array.from(e),
        count: e.size,
        max: t
      }
    });
    window.dispatchEvent(w);
  }
  function x(w, T = "desc") {
    s.field = w, s.order = T;
    const O = new CustomEvent(n.SORTED, {
      detail: { field: w, order: T }
    });
    window.dispatchEvent(O);
  }
  function $() {
    return { ...s };
  }
  function F(w, T = {}) {
    const O = new CustomEvent(n.MODAL_OPEN, {
      detail: { modalType: w, data: T }
    });
    window.dispatchEvent(O);
  }
  function j(w) {
    const T = new CustomEvent(n.MODAL_CLOSE, {
      detail: { modalType: w }
    });
    window.dispatchEvent(T);
  }
  function Y() {
    return b() !== null;
  }
  function Z() {
    return { ...n };
  }
  function Q() {
    typeof RealtySoftState < "u" && RealtySoftState && RealtySoftState.set("wishlist", f());
  }
  return typeof document < "u" && (document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", Q) : Q()), {
    // Core wishlist operations
    getAll: i,
    has: a,
    add: l,
    remove: d,
    toggle: y,
    count: p,
    get: S,
    updateNote: C,
    clear: k,
    getAsArray: L,
    getRefNos: f,
    generateShareLink: u,
    loadSharedWishlist: b,
    exportAsJSON: M,
    notifyChange: z,
    // Compare functionality
    getCompareSelected: W,
    setCompareSelected: G,
    addToCompare: U,
    removeFromCompare: te,
    toggleCompare: E,
    isInCompare: N,
    clearCompare: K,
    getCompareCount: ie,
    getMaxCompare: X,
    getCompareProperties: ce,
    // Sort functionality
    setSort: x,
    getSort: $,
    // Modal communication
    openModal: F,
    closeModal: j,
    // Shared view detection
    isSharedView: Y,
    // Event constants
    getEvents: Z,
    EVENTS: n
  };
}();
typeof window < "u" && (window.WishlistManager = I);
const Ye = "rs_router_scroll", Je = "rs_router_listing_url", Se = /* @__PURE__ */ function() {
  let _ = !1, n = !1, e = [];
  function t() {
    _ || (_ = !0, window.addEventListener("popstate", d), n = l().length > 0, console.log("[RealtySoftRouter] Initialized, enabled:", n));
  }
  function s() {
    return !1;
  }
  function i(S, C) {
    {
      window.location.href = C;
      return;
    }
  }
  function r() {
    for (const k of e)
      k.style.display = "";
    e = [], window._rsAutoInjectedRef = void 0;
    const S = p();
    if (S)
      history.pushState({ rsView: "listing" }, "", S);
    else {
      history.back();
      return;
    }
    const C = y();
    C > 0 && requestAnimationFrame(() => {
      window.scrollTo({ top: C, behavior: "instant" });
    }), console.log("[RealtySoftRouter] Navigated back to listing");
  }
  function a() {
    return e.length > 0 || !!p();
  }
  function l() {
    const S = [
      ".rs_property_grid",
      ".rs-property-grid",
      '[class*="rs-listing-template"]',
      '[class*="rs-search-template"]',
      ".rs_search",
      "#rs_search",
      ".rs_listing",
      "#rs_listing",
      ".rs_property_carousel",
      ".rs-property-carousel",
      ".rs_pagination",
      ".rs-pagination",
      ".rs_results_count",
      ".rs-results-count",
      ".rs_sort",
      ".rs_view_toggle"
    ], C = [], k = /* @__PURE__ */ new Set();
    for (const L of S)
      document.querySelectorAll(L).forEach((f) => {
        k.has(f) || (k.add(f), C.push(f));
      });
    return C;
  }
  function d(S) {
    const C = S.state;
    if (C && C.rsView === "listing") {
      for (const L of e)
        L.style.display = "";
      e = [], window._rsAutoInjectedRef = void 0;
      const k = y();
      k > 0 && requestAnimationFrame(() => {
        window.scrollTo({ top: k, behavior: "instant" });
      });
    } else C && C.rsView === "detail" && C.ref;
  }
  function y() {
    try {
      return parseInt(sessionStorage.getItem(Ye) || "0", 10) || 0;
    } catch {
      return 0;
    }
  }
  function p() {
    try {
      return sessionStorage.getItem(Je);
    } catch {
      return null;
    }
  }
  return {
    init: t,
    isEnabled: s,
    navigateToProperty: i,
    navigateToListing: r,
    canGoBackToListing: a
  };
}();
typeof window < "u" && (window.RealtySoftRouter = Se);
const Xe = function() {
  (function() {
    if (window.__rsSSR) return;
    if (document.getElementById("rs-early-hide")) {
      document.addEventListener("DOMContentLoaded", () => {
        document.body.classList.add("rs-property-detail");
      }), setTimeout(() => {
        document.body.classList.add("rs-property-ready");
        const q = document.getElementById("rs-early-hide");
        q && q.remove();
        const B = document.getElementById("rs-loading-overlay");
        B && B.remove();
      }, 5e3);
      return;
    }
    const m = (window.RealtySoftConfig || {}).propertyPageSlug || "property", v = new RegExp("/" + m + "/[^/]+", "i").test(window.location.pathname), P = /[?&]ref(erence)?=/i.test(window.location.search);
    if (!v && !P) return;
    document.addEventListener("DOMContentLoaded", () => {
      document.body.classList.add("rs-property-detail");
    });
    const R = document.createElement("style");
    R.id = "rs-early-hide", R.textContent = 'body:not(.rs-property-ready) > *:not(script):not(style):not(link) {  visibility: hidden !important;}body:not(.rs-property-ready)::after {  content: "";  position: fixed;  top: 0; left: 0; right: 0; bottom: 0;  background: #fff;  z-index: 999999;}', (document.head || document.documentElement).appendChild(R), setTimeout(() => {
      document.body.classList.add("rs-property-ready"), R.remove();
    }, 5e3);
  })(), console.log("[RealtySoft] Version 3.0.0 - TypeScript Build");
  const _ = {}, n = [];
  let e = !1, t = null;
  function s(h, g) {
    const m = {};
    let v = [];
    const P = h;
    if (P && Array.isArray(P.data))
      v = P.data;
    else if (Array.isArray(h))
      v = h;
    else if (P && !P.data && !P.count)
      return P;
    if (v.length === 0) return m;
    const R = {
      location: ["search_location"],
      sublocation: ["search_sublocation"],
      property_type: ["search_property_type"],
      status: ["search_listing_type", "search_listing_type_all", "status"],
      bed: ["search_bedrooms", "bedrooms"],
      bath: ["search_bathrooms", "bathrooms"],
      price: ["search_price", "price"],
      min_price: ["search_price_min", "search_price_select_min"],
      max_price: ["search_price_max", "search_price_select_max"],
      submit: ["search_button"],
      reset: ["search_reset"],
      ref: ["search_reference", "detail_reference", "card_ref"],
      features_heading: ["search_features", "detail_features"],
      build_size_value: ["search_built_area", "detail_built_area", "build_size"],
      plot_size_value: ["search_plot_size", "detail_plot_size", "plot_size"],
      min_build: ["search_min"],
      max_build: ["search_max"],
      order_drop_down: ["results_sort", "sort_by"],
      not_found_message: ["results_count_zero", "no_results"],
      close_button: ["general_close", "close"],
      more_button: ["pagination_load_more"],
      property_detail_ref_no: ["detail_reference"],
      property_detail_price: ["detail_price"],
      property_detail_description: ["detail_description"],
      property_detail_location: ["detail_location", "location"],
      property_detail_sublocation: ["detail_sublocation"],
      property_detail_property_type: ["detail_property_type"],
      property_detail_bedrooms: ["bedrooms", "card_beds"],
      property_detail_bathrooms: ["bathrooms", "card_baths"],
      property_detail_plot_size: ["detail_plot_size"],
      property_detail_living_area: ["detail_built_area"],
      property_detail_terrace: ["detail_terrace"],
      property_listing_read_more_button: ["card_view", "view_details"],
      property_listing_reference: ["card_ref"],
      property_listing_bedrooms: ["card_beds"],
      property_listing_bathrooms: ["card_baths"],
      property_listing_built_area: ["build_size"],
      property_listing_plot: ["plot_size"],
      property_listing_price: ["price"],
      property_listing_month: ["detail_per_month"],
      property_button_text: ["view_details", "card_view"],
      property_property_sale: ["listing_type_sale", "search_sale"],
      tab_sale: ["listing_type_sale", "search_sale"],
      tab_rent: ["search_rent", "listing_type_long_rental"],
      tab_holiday: ["listing_type_short_rental"],
      tab_dev: ["listing_type_new"]
    };
    for (const q of v) {
      const B = q.code;
      if (!B) continue;
      let H = q[g];
      if (!H) {
        const ee = g.split("_")[0];
        for (const J of Object.keys(q))
          if (J !== "code" && J.startsWith(ee)) {
            H = q[J];
            break;
          }
      }
      if (!H) continue;
      if (B === "label_status_dropdown") {
        const ee = {
          resale: "listing_type_sale",
          development: "listing_type_new",
          long_rental: "listing_type_long_rental",
          short_rental: "listing_type_short_rental"
        }, J = H.split(",");
        for (const de of J) {
          const [oe, he] = de.split("|");
          oe && he && ee[oe.trim()] && (m[ee[oe.trim()]] = he.trim());
        }
        continue;
      }
      if (B === "order_button") {
        const ee = {
          list_price_asc: "sort_price_asc",
          list_price_desc: "sort_price_desc",
          last_date_desc: "sort_newest"
        }, J = H.split(",");
        for (const de of J) {
          const [oe, he] = de.split("|");
          oe && he && ee[oe.trim()] && (m[ee[oe.trim()]] = he.trim());
        }
        continue;
      }
      const re = R[B];
      if (re)
        for (const ee of re)
          m[ee] = H;
      else
        m[B] = H;
    }
    return console.log("[RealtySoft] Transformed", Object.keys(m).length, "API labels for language:", g), m;
  }
  function i(h) {
    if (!h) return ["en_US"];
    const g = h;
    let m = [];
    if (g && Array.isArray(g.data) ? m = g.data : Array.isArray(h) && (m = h), m.length === 0) return ["en_US"];
    const v = /* @__PURE__ */ new Set(), P = Math.min(m.length, 10);
    for (let q = 0; q < P; q++) {
      const B = m[q];
      for (const H of Object.keys(B))
        H !== "code" && /^[a-z]{2}_[A-Z]{2}$/.test(H) && v.add(H);
    }
    return v.add("en_US"), Array.from(v).sort();
  }
  function r(h) {
    const g = {}, m = {
      "rs-location": "location",
      "rs-property-type": "propertyType",
      "rs-listing-type": "listingType",
      "rs-beds-min": "bedsMin",
      "rs-beds-max": "bedsMax",
      "rs-baths-min": "bathsMin",
      "rs-baths-max": "bathsMax",
      "rs-price-min": "priceMin",
      "rs-price-max": "priceMax",
      "rs-built-min": "builtMin",
      "rs-built-max": "builtMax",
      "rs-plot-min": "plotMin",
      "rs-plot-max": "plotMax",
      "rs-features": "features",
      "rs-ref": "ref"
    }, v = [
      "bedsMin",
      "bedsMax",
      "bathsMin",
      "bathsMax",
      "priceMin",
      "priceMax",
      "builtMin",
      "builtMax",
      "plotMin",
      "plotMax",
      "location",
      "propertyType"
    ];
    for (const [P, R] of Object.entries(m)) {
      const q = P.replace(/-([a-z])/g, (H) => H[1].toUpperCase()), B = h.dataset[q];
      B !== void 0 && B !== "" && (v.includes(R) ? g[R] = parseInt(B, 10) : R === "features" ? g[R] = B.split(",").map((H) => parseInt(H.trim(), 10)) : g[R] = B);
    }
    return g;
  }
  function a() {
    const h = !!document.getElementById("rs_search") || !!document.querySelector(".rs-search-template-01") || !!document.querySelector(".rs-search-template-02") || !!document.querySelector(".rs-search-template-03") || !!document.querySelector(".rs-search-template-04") || !!document.querySelector(".rs-search-template-05") || !!document.querySelector(".rs-search-template-06");
    let g = !!document.getElementById("rs_listing") || !!document.querySelector(".rs-listing-template-01") || !!document.querySelector(".rs-listing-template-02") || !!document.querySelector(".rs-listing-template-03") || !!document.querySelector(".rs-listing-template-04") || !!document.querySelector(".rs-listing-template-05") || !!document.querySelector(".rs-listing-template-06") || !!document.querySelector(".rs-listing-template-07") || !!document.querySelector(".rs-listing-template-08") || !!document.querySelector(".rs-listing-template-09") || !!document.querySelector(".rs-listing-template-10") || !!document.querySelector(".rs-listing-template-11") || !!document.querySelector(".rs-listing-template-12");
    if (g) {
      const m = document.querySelectorAll(
        '#rs_listing, [class*="rs-listing-template-"]'
      );
      g = Array.from(m).some(
        (v) => !v.hasAttribute("data-rs-standalone")
      );
    }
    return h && g ? "combined" : h && !g ? "search-only" : !h && g ? "results-only" : null;
  }
  function l() {
    const h = window.RealtySoftConfig || {};
    return h.resultsPage ? h.resultsPage : "/properties";
  }
  function d(h) {
    const g = l(), m = new URLSearchParams();
    h.location && m.set("location", String(h.location)), h.sublocation && m.set("sublocation", String(h.sublocation)), h.propertyType && m.set("type", String(h.propertyType)), h.listingType && m.set("listing", h.listingType), h.bedsMin && m.set("beds", String(h.bedsMin)), h.bathsMin && m.set("baths", String(h.bathsMin)), h.priceMin && m.set("price_min", String(h.priceMin)), h.priceMax && m.set("price_max", String(h.priceMax)), h.builtMin && m.set("built_min", String(h.builtMin)), h.builtMax && m.set("built_max", String(h.builtMax)), h.plotMin && m.set("plot_min", String(h.plotMin)), h.plotMax && m.set("plot_max", String(h.plotMax)), h.ref && m.set("ref", h.ref), h.features && h.features.length > 0 && m.set("features", h.features.join(","));
    const v = m.toString();
    return v ? `${g}?${v}` : g;
  }
  function y() {
    const h = new URLSearchParams(window.location.search), g = {};
    if (h.has("location")) {
      const m = parseInt(h.get("location") || "", 10);
      isNaN(m) || (g.location = m);
    }
    if (h.has("sublocation")) {
      const m = parseInt(h.get("sublocation") || "", 10);
      isNaN(m) || (g.sublocation = m);
    }
    if (h.has("type")) {
      const m = parseInt(h.get("type") || "", 10);
      isNaN(m) || (g.propertyType = m);
    }
    if (h.has("listing") && (g.listingType = h.get("listing") || void 0), h.has("beds")) {
      const m = parseInt(h.get("beds") || "", 10);
      isNaN(m) || (g.bedsMin = m);
    }
    if (h.has("baths")) {
      const m = parseInt(h.get("baths") || "", 10);
      isNaN(m) || (g.bathsMin = m);
    }
    if (h.has("price_min")) {
      const m = parseInt(h.get("price_min") || "", 10);
      isNaN(m) || (g.priceMin = m);
    }
    if (h.has("price_max")) {
      const m = parseInt(h.get("price_max") || "", 10);
      isNaN(m) || (g.priceMax = m);
    }
    if (h.has("built_min")) {
      const m = parseInt(h.get("built_min") || "", 10);
      isNaN(m) || (g.builtMin = m);
    }
    if (h.has("built_max")) {
      const m = parseInt(h.get("built_max") || "", 10);
      isNaN(m) || (g.builtMax = m);
    }
    if (h.has("plot_min")) {
      const m = parseInt(h.get("plot_min") || "", 10);
      isNaN(m) || (g.plotMin = m);
    }
    if (h.has("plot_max")) {
      const m = parseInt(h.get("plot_max") || "", 10);
      isNaN(m) || (g.plotMax = m);
    }
    if (h.has("ref") && (g.ref = h.get("ref") || void 0), h.has("features")) {
      const m = h.get("features");
      m && (g.features = m.split(",").map((v) => parseInt(v, 10)).filter((v) => !isNaN(v)));
    }
    if (Object.keys(g).length > 0) {
      console.log("[RealtySoft] Applying URL filters:", g);
      for (const [m, v] of Object.entries(g))
        D.set(`filters.${m}`, v);
    }
  }
  let p = null;
  const S = {
    // Search Template 01: Compact Horizontal (2-row)
    "rs-search-template-01": `
      <div class="rs-template-search-01__row rs-template-search-01__row--primary">
        <div class="rs-template-search-01__field rs-template-search-01__field--reference">
          <div class="rs_ref"></div>
        </div>
        <div class="rs-template-search-01__field rs-template-search-01__field--location">
          <div class="rs_location" data-rs-variation="2"></div>
        </div>
        <div class="rs-template-search-01__field rs-template-search-01__field--type">
          <div class="rs_property_type" data-rs-variation="2"></div>
        </div>
        <div class="rs-template-search-01__field rs-template-search-01__field--search">
          <div class="rs_search_button"></div>
        </div>
      </div>
      <div class="rs-template-search-01__row rs-template-search-01__row--secondary">
        <div class="rs-template-search-01__field rs-template-search-01__field--beds">
          <div class="rs_bedrooms" data-rs-variation="1"></div>
        </div>
        <div class="rs-template-search-01__field rs-template-search-01__field--baths">
          <div class="rs_bathrooms" data-rs-variation="1"></div>
        </div>
        <div class="rs-template-search-01__field rs-template-search-01__field--price-min">
          <div class="rs_price" data-rs-variation="1" data-rs-type="min"></div>
        </div>
        <div class="rs-template-search-01__field rs-template-search-01__field--price-max">
          <div class="rs_price" data-rs-variation="1" data-rs-type="max"></div>
        </div>
        <div class="rs-template-search-01__field rs-template-search-01__field--listing-type">
          <div class="rs_listing_type" data-rs-variation="1"></div>
        </div>
        <div class="rs-template-search-01__field rs-template-search-01__field--features">
          <div class="rs_features"></div>
        </div>
        <div class="rs-template-search-01__field rs-template-search-01__field--reset">
          <div class="rs_reset_button"></div>
        </div>
      </div>
    `,
    // Search Template 02: Single Row with More Filters Dropdown
    "rs-search-template-02": `
      <div class="rs-template-search-02__row">
        <div class="rs-template-search-02__field rs-template-search-02__field--location">
          <div class="rs_location" data-rs-variation="1" data-rs-placeholder="Search Location"></div>
        </div>
        <div class="rs-template-search-02__field rs-template-search-02__field--property-type">
          <div class="rs_property_type" data-rs-variation="2" data-rs-placeholder="Property Type"></div>
        </div>
        <div class="rs-template-search-02__field rs-template-search-02__field--price">
          <div class="rs_price" data-rs-variation="1" data-rs-type="min" data-rs-placeholder="Min Price"></div>
        </div>
        <div class="rs-template-search-02__field rs-template-search-02__field--price">
          <div class="rs_price" data-rs-variation="1" data-rs-type="max" data-rs-placeholder="Max Price"></div>
        </div>
        <div class="rs-template-search-02__more-filters-wrapper">
          <button type="button" class="rs-template-search-02__more-filters-btn">
            <svg class="rs-template-search-02__more-filters-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            <span>More Filters</span>
            <svg class="rs-template-search-02__more-filters-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <div class="rs-template-search-02__dropdown">
            <div class="rs-template-search-02__dropdown-header">
              <span class="rs-template-search-02__dropdown-title">More Filters</span>
              <button type="button" class="rs-template-search-02__dropdown-close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div class="rs-template-search-02__dropdown-section">
              <div class="rs-template-search-02__dropdown-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Reference
              </div>
              <div class="rs-template-search-02__dropdown-field">
                <div class="rs_ref" data-rs-placeholder="Reference"></div>
              </div>
            </div>
            <div class="rs-template-search-02__dropdown-section">
              <div class="rs-template-search-02__dropdown-row">
                <div class="rs-template-search-02__dropdown-col">
                  <div class="rs-template-search-02__dropdown-label">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M2 4v16"></path>
                      <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                      <path d="M2 17h20"></path>
                      <path d="M6 8v9"></path>
                    </svg>
                    Bedrooms
                  </div>
                  <div class="rs-template-search-02__dropdown-field">
                    <div class="rs_bedrooms" data-rs-variation="1" data-rs-type="min" data-rs-placeholder="Min. Bedrooms"></div>
                  </div>
                </div>
                <div class="rs-template-search-02__dropdown-col">
                  <div class="rs-template-search-02__dropdown-label">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"></path>
                      <path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"></path>
                      <circle cx="12" cy="5" r="2"></circle>
                    </svg>
                    Bathrooms
                  </div>
                  <div class="rs-template-search-02__dropdown-field">
                    <div class="rs_bathrooms" data-rs-variation="1" data-rs-type="min" data-rs-placeholder="Min. Bathrooms"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="rs-template-search-02__dropdown-section">
              <div class="rs-template-search-02__dropdown-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                  <path d="M3 9h18"></path>
                  <path d="M9 21V9"></path>
                </svg>
                Min. Build
              </div>
              <div class="rs-template-search-02__dropdown-field">
                <div class="rs_built_area" data-rs-variation="1" data-rs-type="min" data-rs-placeholder="Min. Build"></div>
              </div>
            </div>
            <div class="rs-template-search-02__dropdown-section">
              <div class="rs-template-search-02__dropdown-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6l9-4 9 4v12l-9 4-9-4V6z"></path>
                  <path d="M12 2v20"></path>
                </svg>
                Min. Plot
              </div>
              <div class="rs-template-search-02__dropdown-field">
                <div class="rs_plot_size" data-rs-variation="1" data-rs-type="min" data-rs-placeholder="Min. Plot"></div>
              </div>
            </div>
            <div class="rs-template-search-02__dropdown-section">
              <div class="rs-template-search-02__dropdown-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Status
              </div>
              <div class="rs-template-search-02__dropdown-field">
                <div class="rs_listing_type" data-rs-variation="3"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="rs-template-search-02__field rs-template-search-02__field--search">
          <div class="rs_search_button"></div>
        </div>
        <div class="rs-template-search-02__field rs-template-search-02__field--reset">
          <div class="rs_reset_button"></div>
        </div>
      </div>
    `,
    // Search Template 03: Tab-Based Search
    "rs-search-template-03": `
      <div class="rs-template-search-03__tabs">
        <button type="button" class="rs-template-search-03__tab is-active" data-listing-type="resale">Sales</button>
        <button type="button" class="rs-template-search-03__tab" data-listing-type="development">New Developments</button>
        <button type="button" class="rs-template-search-03__tab" data-listing-type="long_rental">Rentals</button>
        <button type="button" class="rs-template-search-03__tab" data-listing-type="short_rental">Holiday Rentals</button>
      </div>
      <div class="rs-template-search-03__form">
        <div class="rs-template-search-03__row rs-template-search-03__row--filters">
          <div class="rs-template-search-03__field rs-template-search-03__field--location">
            <div class="rs_location" data-rs-variation="3" data-rs-placeholder="Location"></div>
          </div>
          <div class="rs-template-search-03__field rs-template-search-03__field--type">
            <div class="rs_property_type" data-rs-variation="2" data-rs-placeholder="Property Type"></div>
          </div>
          <div class="rs-template-search-03__field rs-template-search-03__field--beds">
            <div class="rs_bedrooms" data-rs-variation="1" data-rs-placeholder="Bedrooms"></div>
          </div>
          <div class="rs-template-search-03__field rs-template-search-03__field--baths">
            <div class="rs_bathrooms" data-rs-variation="1" data-rs-placeholder="Bathrooms"></div>
          </div>
          <div class="rs-template-search-03__field rs-template-search-03__field--price-min">
            <div class="rs_price" data-rs-variation="1" data-rs-type="min" data-rs-placeholder="Min Price"></div>
          </div>
          <div class="rs-template-search-03__field rs-template-search-03__field--price-max">
            <div class="rs_price" data-rs-variation="1" data-rs-type="max" data-rs-placeholder="Max Price"></div>
          </div>
          <div class="rs-template-search-03__field rs-template-search-03__field--reference">
            <div class="rs_ref" data-rs-placeholder="Reference"></div>
          </div>
        </div>
        <div class="rs-template-search-03__row rs-template-search-03__row--actions">
          <div class="rs-template-search-03__features">
            <div class="rs_features"></div>
          </div>
          <div class="rs-template-search-03__field rs-template-search-03__field--search">
            <div class="rs_search_button"></div>
          </div>
        </div>
      </div>
    `,
    // Search Template 04: Dark Horizontal Bar
    "rs-search-template-04": `
      <div class="rs-template-search-04__row rs-template-search-04__row--primary">
        <div class="rs-template-search-04__field rs-template-search-04__field--reference">
          <label class="rs-template-search-04__label">Reference</label>
          <div class="rs_ref" data-rs-placeholder="Ref"></div>
        </div>
        <div class="rs-template-search-04__field rs-template-search-04__field--location">
          <label class="rs-template-search-04__label">Location</label>
          <div class="rs_location" data-rs-variation="2" data-rs-placeholder="Any"></div>
        </div>
        <div class="rs-template-search-04__field rs-template-search-04__field--type">
          <label class="rs-template-search-04__label">Property Type</label>
          <div class="rs_property_type" data-rs-variation="2" data-rs-placeholder="Any"></div>
        </div>
        <div class="rs-template-search-04__field rs-template-search-04__field--status">
          <label class="rs-template-search-04__label">Status</label>
          <div class="rs_listing_type" data-rs-variation="1" data-rs-placeholder="Any"></div>
        </div>
      </div>
      <div class="rs-template-search-04__row rs-template-search-04__row--secondary">
        <div class="rs-template-search-04__field rs-template-search-04__field--beds">
          <label class="rs-template-search-04__label">Bed</label>
          <div class="rs_bedrooms" data-rs-variation="1" data-rs-placeholder="Any"></div>
        </div>
        <div class="rs-template-search-04__field rs-template-search-04__field--baths">
          <label class="rs-template-search-04__label">Bath</label>
          <div class="rs_bathrooms" data-rs-variation="1" data-rs-placeholder="Any"></div>
        </div>
        <div class="rs-template-search-04__field rs-template-search-04__field--price-min">
          <label class="rs-template-search-04__label">Min Price</label>
          <div class="rs_price" data-rs-variation="1" data-rs-type="min" data-rs-placeholder="Any"></div>
        </div>
        <div class="rs-template-search-04__field rs-template-search-04__field--price-max">
          <label class="rs-template-search-04__label">Max Price</label>
          <div class="rs_price" data-rs-variation="1" data-rs-type="max" data-rs-placeholder="Any"></div>
        </div>
        <div class="rs-template-search-04__features">
          <div class="rs_features"></div>
        </div>
        <div class="rs-template-search-04__field rs-template-search-04__field--search">
          <div class="rs_search_button"></div>
        </div>
      </div>
    `,
    // Search Template 05: Vertical Card/Sidebar
    "rs-search-template-05": `
      <div class="rs-template-search-05__field rs-template-search-05__field--reference">
        <div class="rs_ref" data-rs-placeholder="Reference"></div>
      </div>
      <div class="rs-template-search-05__field rs-template-search-05__field--status">
        <div class="rs_listing_type" data-rs-variation="1" data-rs-placeholder="Status"></div>
      </div>
      <div class="rs-template-search-05__field rs-template-search-05__field--location">
        <div class="rs_location" data-rs-variation="2" data-rs-placeholder="Location"></div>
      </div>
      <div class="rs-template-search-05__field rs-template-search-05__field--type">
        <div class="rs_property_type" data-rs-variation="2" data-rs-placeholder="Property Type"></div>
      </div>
      <div class="rs-template-search-05__row-half">
        <div class="rs-template-search-05__field rs-template-search-05__field--beds">
          <div class="rs_bedrooms" data-rs-variation="1" data-rs-placeholder="Bed"></div>
        </div>
        <div class="rs-template-search-05__field rs-template-search-05__field--baths">
          <div class="rs_bathrooms" data-rs-variation="1" data-rs-placeholder="Bath"></div>
        </div>
      </div>
      <div class="rs-template-search-05__row-half">
        <div class="rs-template-search-05__field rs-template-search-05__field--price-min">
          <div class="rs_price" data-rs-variation="1" data-rs-type="min" data-rs-placeholder="Min Price"></div>
        </div>
        <div class="rs-template-search-05__field rs-template-search-05__field--price-max">
          <div class="rs_price" data-rs-variation="1" data-rs-type="max" data-rs-placeholder="Max Price"></div>
        </div>
      </div>
      <div class="rs-template-search-05__field rs-template-search-05__field--search">
        <div class="rs_search_button" data-rs-label="Submit"></div>
      </div>
      <div class="rs-template-search-05__links">
        <div class="rs-template-search-05__features">
          <div class="rs_features"></div>
        </div>
      </div>
    `,
    // Search Template 06: Minimal Single Row
    "rs-search-template-06": `
      <div class="rs-template-search-06__container">
        <div class="rs-template-search-06__field rs-template-search-06__field--location">
          <svg class="rs-template-search-06__location-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <div class="rs_location" data-rs-variation="1" data-rs-placeholder="Enter Location"></div>
        </div>
        <div class="rs-template-search-06__field rs-template-search-06__field--type">
          <div class="rs_property_type" data-rs-variation="2" data-rs-placeholder="Property Type"></div>
        </div>
        <div class="rs-template-search-06__field rs-template-search-06__field--search">
          <div class="rs_search_button" data-rs-label="Search Here"></div>
        </div>
      </div>
    `,
    // Listing Template 01: Location-First Cards
    "rs-listing-template-01": `
      <div class="rs-template-listing-01__header">
        <div class="rs_results_count"></div>
        <div class="rs-template-listing-01__controls">
          <div class="rs_sort"></div>
          <div class="rs_view_toggle"></div>
        </div>
      </div>
      <div class="rs_active_filters" style="margin-bottom: 20px;"></div>
      <div class="rs_property_grid">
        <div class="rs_card rs-template-card-01">
          <div class="rs-template-card-01__image-section">
            <a class="rs_card_link rs-template-card-01__image-link">
              <div class="rs_card_carousel"></div>
            </a>
            <button class="rs_card_wishlist" type="button"></button>
            <div class="rs_card_status"></div>
            <div class="rs-template-card-01__image-count">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <span class="rs_card_image_count"></span>
            </div>
          </div>
          <a class="rs_card_link rs-template-card-01__content">
            <h3 class="rs_card_location rs-template-card-01__location"></h3>
            <p class="rs_card_type rs-template-card-01__type"></p>
            <p class="rs_card_description rs-template-card-01__description"></p>
            <div class="rs-template-card-01__specs">
              <div class="rs-template-card-01__spec-item">
                <svg class="rs-template-card-01__spec-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M2 4v16"></path>
                  <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                  <path d="M2 17h20"></path>
                  <path d="M6 8v9"></path>
                </svg>
                <span class="rs_card_beds rs-template-card-01__spec-value"></span>
              </div>
              <div class="rs-template-card-01__spec-item">
                <svg class="rs-template-card-01__spec-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"></path>
                  <line x1="10" x2="8" y1="5" y2="7"></line>
                  <line x1="2" x2="22" y1="12" y2="12"></line>
                  <line x1="7" x2="7" y1="19" y2="21"></line>
                  <line x1="17" x2="17" y1="19" y2="21"></line>
                </svg>
                <span class="rs_card_baths rs-template-card-01__spec-value"></span>
              </div>
              <div class="rs-template-card-01__spec-item">
                <svg class="rs-template-card-01__spec-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
                <span class="rs_card_built rs-template-card-01__spec-value"></span>
              </div>
              <div class="rs-template-card-01__spec-item">
                <svg class="rs-template-card-01__spec-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M3 6l9-4 9 4v12l-9 4-9-4V6z"></path>
                  <path d="M12 2v20"></path>
                  <path d="M3 6l9 4 9-4"></path>
                </svg>
                <span class="rs_card_plot rs-template-card-01__spec-value"></span>
              </div>
            </div>
            <div class="rs_card_price rs-template-card-01__price"></div>
          </a>
        </div>
      </div>
      <div class="rs_pagination" style="margin-top: 30px;"></div>
    `,
    // Listing Template 02: Price on Image Cards
    "rs-listing-template-02": `
      <div class="rs-template-listing-02__header">
        <div class="rs_results_count"></div>
        <div class="rs-template-listing-02__controls">
          <div class="rs_sort"></div>
          <div class="rs_view_toggle"></div>
        </div>
      </div>
      <div class="rs_active_filters" style="margin-bottom: 20px;"></div>
      <div class="rs_property_grid">
        <div class="rs_card rs-template-card-02">
          <div class="rs-template-card-02__image-section">
            <a class="rs_card_link rs-template-card-02__image-link">
              <div class="rs_card_carousel"></div>
              <div class="rs-template-card-02__image-overlay"></div>
            </a>
            <div class="rs_card_status rs-template-card-02__status"></div>
            <button class="rs_card_wishlist rs-template-card-02__wishlist" type="button"></button>
            <div class="rs-template-card-02__image-bottom-left">
              <div class="rs-template-card-02__image-count">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <span class="rs_card_image_count"></span>
              </div>
            </div>
            <div class="rs-template-card-02__price-overlay">
              <span class="rs_card_price rs-template-card-02__price"></span>
              <span class="rs_card_price_suffix rs-template-card-02__price-suffix"></span>
            </div>
          </div>
          <a class="rs_card_link rs-template-card-02__content">
            <div class="rs-template-card-02__title-row">
              <h3 class="rs_card_title rs-template-card-02__title"></h3>
              <span class="rs-template-card-02__arrow-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="7" y1="17" x2="17" y2="7"></line>
                  <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
              </span>
            </div>
            <p class="rs_card_location rs-template-card-02__location"></p>
            <div class="rs-template-card-02__specs">
              <span class="rs-template-card-02__spec">
                <span class="rs-template-card-02__spec-label">Beds:</span>
                <span class="rs_card_beds rs-template-card-02__spec-value"></span>
              </span>
              <span class="rs-template-card-02__spec">
                <span class="rs-template-card-02__spec-label">Baths:</span>
                <span class="rs_card_baths rs-template-card-02__spec-value"></span>
              </span>
              <span class="rs-template-card-02__spec">
                <span class="rs-template-card-02__spec-label">Area:</span>
                <span class="rs_card_built rs-template-card-02__spec-value"></span>
              </span>
            </div>
          </a>
        </div>
      </div>
      <div class="rs_pagination" style="margin-top: 30px;"></div>
    `,
    // Listing Template 03: Horizontal Card (Image left 40%, Content right 60%)
    "rs-listing-template-03": `
      <div class="rs-template-listing-03__header">
        <div class="rs_results_count"></div>
        <div class="rs-template-listing-03__controls">
          <div class="rs_sort"></div>
          <div class="rs_view_toggle"></div>
        </div>
      </div>
      <div class="rs_active_filters" style="margin-bottom: 20px;"></div>
      <div class="rs_property_grid">
        <div class="rs_card rs-template-card-03">
          <div class="rs-template-card-03__image-section">
            <a class="rs_card_link rs-template-card-03__image-link">
              <div class="rs_card_carousel"></div>
            </a>
            <div class="rs_card_status rs-template-card-03__status"></div>
            <div class="rs-template-card-03__image-count">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <span class="rs_card_image_count"></span>
            </div>
            <div class="rs-template-card-03__carousel-dots"></div>
          </div>
          <button class="rs_card_wishlist rs-template-card-03__wishlist" type="button"></button>
          <a class="rs_card_link rs-template-card-03__content">
            <div class="rs-template-card-03__tags">
              <span class="rs_card_type rs-template-card-03__tag"></span>
            </div>
            <h3 class="rs_card_title rs-template-card-03__title"></h3>
            <div class="rs-template-card-03__specs">
              <span class="rs-template-card-03__spec">
                <svg class="rs-template-card-03__spec-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M2 4v16"></path>
                  <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                  <path d="M2 17h20"></path>
                  <path d="M6 8v9"></path>
                </svg>
                <span class="rs_card_beds"></span>
              </span>
              <span class="rs-template-card-03__spec">
                <svg class="rs-template-card-03__spec-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"></path>
                  <path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"></path>
                  <circle cx="12" cy="5" r="2"></circle>
                </svg>
                <span class="rs_card_baths"></span>
              </span>
              <span class="rs-template-card-03__spec">
                <svg class="rs-template-card-03__spec-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
                <span class="rs_card_built"></span>
              </span>
            </div>
            <div class="rs-template-card-03__bottom">
              <div class="rs-template-card-03__price-pill">
                <span class="rs_card_price"></span>
                <span class="rs_card_price_suffix"></span>
              </div>
            </div>
          </a>
        </div>
      </div>
      <div class="rs_pagination" style="margin-top: 30px;"></div>
    `,
    // Listing Template 04: Airbnb Style (Vertical, full-width image)
    "rs-listing-template-04": `
      <div class="rs-template-listing-04__header">
        <div class="rs_results_count"></div>
        <div class="rs-template-listing-04__controls">
          <div class="rs_sort"></div>
          <div class="rs_view_toggle"></div>
        </div>
      </div>
      <div class="rs_active_filters" style="margin-bottom: 20px;"></div>
      <div class="rs_property_grid">
        <div class="rs_card rs-template-card-04">
          <div class="rs-template-card-04__image-section">
            <a class="rs_card_link rs-template-card-04__image-link">
              <div class="rs_card_carousel"></div>
            </a>
            <div class="rs_card_status rs-template-card-04__status"></div>
            <div class="rs-template-card-04__image-count">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <span class="rs_card_image_count"></span>
            </div>
            <div class="rs-template-card-04__carousel-dots"></div>
          </div>
          <button class="rs_card_wishlist rs-template-card-04__wishlist" type="button"></button>
          <a class="rs_card_link rs-template-card-04__content">
            <div class="rs-template-card-04__meta">
              <span class="rs_card_type rs-template-card-04__type"></span>
              <span class="rs-template-card-04__meta-separator">&middot;</span>
              <span class="rs_card_beds rs-template-card-04__beds"></span>
            </div>
            <h3 class="rs_card_title rs-template-card-04__title"></h3>
            <div class="rs-template-card-04__location">
              <svg class="rs-template-card-04__location-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span class="rs_card_location"></span>
            </div>
            <div class="rs-template-card-04__price-row">
              <span class="rs_card_price rs-template-card-04__price"></span>
              <span class="rs_card_price_suffix rs-template-card-04__price-suffix"></span>
            </div>
          </a>
        </div>
      </div>
      <div class="rs_pagination" style="margin-top: 30px;"></div>
    `,
    // Listing Template 05: Hover Overlay (Image only, content on hover)
    "rs-listing-template-05": `
      <div class="rs-template-listing-05__header">
        <div class="rs_results_count"></div>
        <div class="rs-template-listing-05__controls">
          <div class="rs_sort"></div>
          <div class="rs_view_toggle"></div>
        </div>
      </div>
      <div class="rs_active_filters" style="margin-bottom: 20px;"></div>
      <div class="rs_property_grid">
        <div class="rs_card rs-template-card-05">
          <a class="rs_card_link rs-template-card-05__link">
            <div class="rs-template-card-05__image-section">
              <div class="rs_card_carousel"></div>
            </div>
            <div class="rs_card_status rs-template-card-05__status"></div>
            <div class="rs-template-card-05__image-count">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <span class="rs_card_image_count"></span>
            </div>
            <div class="rs-template-card-05__overlay">
              <div class="rs-template-card-05__overlay-content">
                <h3 class="rs_card_title rs-template-card-05__title"></h3>
                <div class="rs_card_price rs-template-card-05__price"></div>
                <div class="rs-template-card-05__specs">
                  <span class="rs-template-card-05__spec">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M2 4v16"></path>
                      <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                      <path d="M2 17h20"></path>
                      <path d="M6 8v9"></path>
                    </svg>
                    <span class="rs_card_beds"></span>
                  </span>
                  <span class="rs-template-card-05__spec">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"></path>
                      <path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"></path>
                      <circle cx="12" cy="5" r="2"></circle>
                    </svg>
                    <span class="rs_card_baths"></span>
                  </span>
                  <span class="rs-template-card-05__spec">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                      <line x1="3" y1="9" x2="21" y2="9"></line>
                      <line x1="9" y1="21" x2="9" y2="9"></line>
                    </svg>
                    <span class="rs_card_built"></span>
                  </span>
                  <span class="rs-template-card-05__spec">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 6l9-4 9 4v12l-9 4-9-4V6z"></path>
                      <path d="M12 2v20"></path>
                    </svg>
                    <span class="rs_card_plot"></span>
                  </span>
                </div>
                <span class="rs-template-card-05__view-link">View Details</span>
              </div>
            </div>
          </a>
          <button class="rs_card_wishlist rs-template-card-05__wishlist" type="button"></button>
        </div>
      </div>
      <div class="rs_pagination" style="margin-top: 30px;"></div>
    `,
    // Listing Template 06: Gradient Overlay (Full image with permanent dark gradient)
    "rs-listing-template-06": `
      <div class="rs-template-listing-06__header">
        <div class="rs_results_count"></div>
        <div class="rs-template-listing-06__controls">
          <div class="rs_sort"></div>
          <div class="rs_view_toggle"></div>
        </div>
      </div>
      <div class="rs_active_filters" style="margin-bottom: 20px;"></div>
      <div class="rs_property_grid">
        <div class="rs_card rs-template-card-06">
          <a class="rs_card_link rs-template-card-06__link">
            <div class="rs-template-card-06__image-section">
              <div class="rs_card_carousel"></div>
              <div class="rs-template-card-06__gradient"></div>
            </div>
            <div class="rs_card_status rs-template-card-06__status"></div>
            <button class="rs_card_wishlist rs-template-card-06__wishlist" type="button"></button>
            <div class="rs-template-card-06__content">
              <h3 class="rs_card_type rs-template-card-06__title"></h3>
              <div class="rs_card_price rs-template-card-06__price"></div>
              <div class="rs-template-card-06__specs">
                <span class="rs-template-card-06__spec">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M2 4v16"></path>
                    <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                    <path d="M2 17h20"></path>
                    <path d="M6 8v9"></path>
                  </svg>
                  <span class="rs_card_beds"></span>
                </span>
                <span class="rs-template-card-06__spec">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"></path>
                    <path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"></path>
                    <circle cx="12" cy="5" r="2"></circle>
                  </svg>
                  <span class="rs_card_baths"></span>
                </span>
                <span class="rs-template-card-06__spec">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="9" y1="21" x2="9" y2="9"></line>
                  </svg>
                  <span class="rs_card_built"></span>
                </span>
              </div>
              <span class="rs-template-card-06__view-link">View Details</span>
            </div>
          </a>
        </div>
      </div>
      <div class="rs_pagination" style="margin-top: 30px;"></div>
    `,
    // Listing Template 07: Dark Overlay with Badges
    "rs-listing-template-07": `
      <div class="rs-template-listing-07__header">
        <div class="rs_results_count"></div>
        <div class="rs-template-listing-07__controls">
          <div class="rs_sort"></div>
          <div class="rs_view_toggle"></div>
        </div>
      </div>
      <div class="rs_active_filters" style="margin-bottom: 20px;"></div>
      <div class="rs_property_grid">
        <div class="rs_card rs-template-card-07">
          <a class="rs_card_link rs-template-card-07__link">
            <div class="rs-template-card-07__image-section">
              <div class="rs_card_carousel"></div>
              <div class="rs-template-card-07__gradient"></div>
            </div>
            <div class="rs-template-card-07__badges">
              <div class="rs_card_status rs-template-card-07__status"></div>
            </div>
            <button class="rs_card_wishlist rs-template-card-07__wishlist" type="button"></button>
            <div class="rs-template-card-07__content">
              <div class="rs-template-card-07__price-row">
                <span class="rs_card_price rs-template-card-07__price"></span>
                <span class="rs_card_price_suffix rs-template-card-07__price-suffix"></span>
              </div>
              <h3 class="rs_card_type rs-template-card-07__title"></h3>
              <div class="rs-template-card-07__specs">
                <span class="rs-template-card-07__spec">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M2 4v16"></path>
                    <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                    <path d="M2 17h20"></path>
                    <path d="M6 8v9"></path>
                  </svg>
                  <span class="rs_card_beds"></span>
                </span>
                <span class="rs-template-card-07__spec">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"></path>
                    <path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"></path>
                    <circle cx="12" cy="5" r="2"></circle>
                  </svg>
                  <span class="rs_card_baths"></span>
                </span>
                <span class="rs-template-card-07__spec">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="9" y1="21" x2="9" y2="9"></line>
                  </svg>
                  <span class="rs_card_built"></span>
                </span>
                <span class="rs-template-card-07__spec">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6l9-4 9 4v12l-9 4-9-4V6z"></path>
                    <path d="M12 2v20"></path>
                  </svg>
                  <span class="rs_card_plot"></span>
                </span>
              </div>
            </div>
          </a>
        </div>
      </div>
      <div class="rs_pagination" style="margin-top: 30px;"></div>
    `,
    // Template 08: Dark Overlay Grid with view toggle
    "rs-listing-template-08": `
      <div class="rs-template-listing-08__header">
        <div class="rs_results_count"></div>
        <div class="rs-template-listing-08__controls">
          <div class="rs_sort"></div>
          <div class="rs_view_toggle"></div>
        </div>
      </div>
      <div class="rs_active_filters" style="margin-bottom: 20px;"></div>
      <div class="rs_property_grid">
        <div class="rs_card rs-template-card-08">
          <a class="rs_card_link rs-template-card-08__link">
            <div class="rs-template-card-08__image-section">
              <div class="rs_card_carousel"></div>
              <div class="rs_card_status rs-template-card-08__status"></div>
              <button class="rs_card_wishlist rs-template-card-08__wishlist" type="button"></button>
              <div class="rs-template-card-08__image-count">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
                <span class="rs_card_image_count"></span>
              </div>
            </div>
            <div class="rs-template-card-08__content">
              <h3 class="rs_card_title rs-template-card-08__title"></h3>
              <div class="rs-template-card-08__specs">
                <span class="rs-template-card-08__spec">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M2 4v16"></path>
                    <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                    <path d="M2 17h20"></path>
                    <path d="M6 8v9"></path>
                  </svg>
                  <span class="rs_card_beds"></span>
                </span>
                <span class="rs-template-card-08__spec">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"></path>
                    <path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"></path>
                    <circle cx="12" cy="5" r="2"></circle>
                  </svg>
                  <span class="rs_card_baths"></span>
                </span>
                <span class="rs-template-card-08__spec">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="9" y1="21" x2="9" y2="9"></line>
                  </svg>
                  <span class="rs_card_built"></span>
                </span>
                <span class="rs-template-card-08__spec">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6l9-4 9 4v12l-9 4-9-4V6z"></path>
                    <path d="M12 2v20"></path>
                  </svg>
                  <span class="rs_card_plot"></span>
                </span>
                <span class="rs_card_price rs-template-card-08__price"></span>
              </div>
            </div>
          </a>
        </div>
      </div>
      <div class="rs_pagination" style="margin-top: 30px;"></div>
    `,
    // Template 09: Horizontal Detail Card (single row, no view toggle)
    "rs-listing-template-09": `
      <div class="rs-template-listing-09__header">
        <div class="rs_results_count"></div>
        <div class="rs-template-listing-09__controls">
          <div class="rs_sort"></div>
        </div>
      </div>
      <div class="rs_active_filters" style="margin-bottom: 20px;"></div>
      <div class="rs_property_grid">
        <div class="rs_card rs-template-card-09">
          <a class="rs_card_link rs-template-card-09__link">
            <div class="rs-template-card-09__image-section">
              <div class="rs_card_carousel"></div>
              <div class="rs_card_status rs-template-card-09__status"></div>
              <button class="rs_card_wishlist rs-template-card-09__wishlist" type="button"></button>
              <div class="rs-template-card-09__image-count">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
                <span class="rs_card_image_count"></span>
              </div>
            </div>
            <div class="rs-template-card-09__content">
              <div class="rs-template-card-09__location-row">
                <span class="rs_card_location rs-template-card-09__location"></span>
              </div>
              <div class="rs-template-card-09__ref-row">
                <span class="rs_card_ref rs-template-card-09__ref"></span>
              </div>
              <h3 class="rs_card_title rs-template-card-09__title"></h3>
              <p class="rs_card_description rs-template-card-09__description"></p>
              <div class="rs-template-card-09__specs">
                <span class="rs-template-card-09__spec">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M2 4v16"></path>
                    <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                    <path d="M2 17h20"></path>
                    <path d="M6 8v9"></path>
                  </svg>
                  <span class="rs_card_beds"></span>
                </span>
                <span class="rs-template-card-09__spec">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"></path>
                    <path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"></path>
                    <circle cx="12" cy="5" r="2"></circle>
                  </svg>
                  <span class="rs_card_baths"></span>
                </span>
                <span class="rs-template-card-09__spec">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="9" y1="21" x2="9" y2="9"></line>
                  </svg>
                  <span class="rs_card_built"></span>
                </span>
                <span class="rs-template-card-09__spec">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6l9-4 9 4v12l-9 4-9-4V6z"></path>
                    <path d="M12 2v20"></path>
                  </svg>
                  <span class="rs_card_plot"></span>
                </span>
              </div>
              <div class="rs_card_price rs-template-card-09__price"></div>
            </div>
          </a>
        </div>
      </div>
      <div class="rs_pagination" style="margin-top: 30px;"></div>
    `,
    // Template 10: Development/Large Card (single row, no view toggle)
    "rs-listing-template-10": `
      <div class="rs-template-listing-10__header">
        <div class="rs_results_count"></div>
        <div class="rs-template-listing-10__controls">
          <div class="rs_sort"></div>
        </div>
      </div>
      <div class="rs_active_filters" style="margin-bottom: 20px;"></div>
      <div class="rs_property_grid">
        <div class="rs_card rs-template-card-10">
          <a class="rs_card_link rs-template-card-10__link">
            <div class="rs-template-card-10__image-section">
              <div class="rs_card_carousel"></div>
              <div class="rs_card_status rs-template-card-10__status"></div>
              <button class="rs_card_wishlist rs-template-card-10__wishlist" type="button"></button>
              <div class="rs-template-card-10__image-count">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
                <span class="rs_card_image_count"></span>
              </div>
            </div>
            <div class="rs-template-card-10__content">
              <h3 class="rs_card_title rs-template-card-10__title"></h3>
              <p class="rs_card_description rs-template-card-10__description"></p>
              <div class="rs-template-card-10__price-row">
                <span class="rs_card_price rs-template-card-10__price"></span>
              </div>
              <div class="rs-template-card-10__specs">
                <span class="rs-template-card-10__spec">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M2 4v16"></path>
                    <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                    <path d="M2 17h20"></path>
                    <path d="M6 8v9"></path>
                  </svg>
                  <span class="rs_card_beds"></span>
                </span>
                <span class="rs-template-card-10__spec">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"></path>
                    <path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"></path>
                    <circle cx="12" cy="5" r="2"></circle>
                  </svg>
                  <span class="rs_card_baths"></span>
                </span>
                <span class="rs-template-card-10__spec">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="9" y1="21" x2="9" y2="9"></line>
                  </svg>
                  <span class="rs_card_built"></span>
                </span>
                <span class="rs-template-card-10__spec">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6l9-4 9 4v12l-9 4-9-4V6z"></path>
                    <path d="M12 2v20"></path>
                  </svg>
                  <span class="rs_card_plot"></span>
                </span>
              </div>
              <div class="rs-template-card-10__actions">
                <span class="rs_card_ref rs-template-card-10__ref-btn"></span>
                <span class="rs-template-card-10__view-details">View Details</span>
              </div>
            </div>
          </a>
        </div>
      </div>
      <div class="rs_pagination" style="margin-top: 30px;"></div>
    `,
    // Template 11: Alternating Dark Content Card (single row, no view toggle)
    "rs-listing-template-11": `
      <div class="rs-template-listing-11__header">
        <div class="rs_results_count"></div>
        <div class="rs-template-listing-11__controls">
          <div class="rs_sort"></div>
        </div>
      </div>
      <div class="rs_active_filters" style="margin-bottom: 20px;"></div>
      <div class="rs_property_grid">
        <div class="rs_card rs-template-card-11">
          <a class="rs_card_link rs-template-card-11__link">
            <div class="rs-template-card-11__image-section">
              <div class="rs_card_carousel"></div>
              <div class="rs_card_status rs-template-card-11__status"></div>
              <button class="rs_card_wishlist rs-template-card-11__wishlist" type="button"></button>
              <div class="rs-template-card-11__image-count">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
                <span class="rs_card_image_count"></span>
              </div>
            </div>
            <div class="rs-template-card-11__content">
              <h3 class="rs_card_title rs-template-card-11__title"></h3>
              <p class="rs_card_description rs-template-card-11__description"></p>
              <div class="rs-template-card-11__specs">
                <span class="rs-template-card-11__spec">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M2 4v16"></path>
                    <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                    <path d="M2 17h20"></path>
                    <path d="M6 8v9"></path>
                  </svg>
                  <span class="rs_card_beds"></span>
                </span>
                <span class="rs-template-card-11__spec">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"></path>
                    <path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"></path>
                    <circle cx="12" cy="5" r="2"></circle>
                  </svg>
                  <span class="rs_card_baths"></span>
                </span>
                <span class="rs-template-card-11__spec">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="9" y1="21" x2="9" y2="9"></line>
                  </svg>
                  <span class="rs_card_built"></span>
                </span>
                <span class="rs-template-card-11__spec">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6l9-4 9 4v12l-9 4-9-4V6z"></path>
                    <path d="M12 2v20"></path>
                  </svg>
                  <span class="rs_card_plot"></span>
                </span>
              </div>
              <div class="rs-template-card-11__price-section">
                <span class="rs-template-card-11__price-label">Price</span>
                <span class="rs_card_price rs-template-card-11__price"></span>
              </div>
              <div class="rs-template-card-11__actions">
                <span class="rs-template-card-11__details-btn">View Details</span>
                <span class="rs_card_ref rs-template-card-11__ref"></span>
              </div>
            </div>
          </a>
        </div>
      </div>
      <div class="rs_pagination" style="margin-top: 30px;"></div>
    `,
    // Template 12: Vertical Grid Card with Read More button
    "rs-listing-template-12": `
      <div class="rs-template-listing-12__header">
        <div class="rs_results_count"></div>
        <div class="rs-template-listing-12__controls">
          <div class="rs_sort"></div>
          <div class="rs_view_toggle"></div>
        </div>
      </div>
      <div class="rs_active_filters" style="margin-bottom: 20px;"></div>
      <div class="rs_property_grid">
        <div class="rs_card rs-template-card-12">
          <a class="rs_card_link rs-template-card-12__link">
            <div class="rs-template-card-12__image-section">
              <div class="rs_card_carousel"></div>
              <div class="rs_card_status rs-template-card-12__status"></div>
              <button class="rs_card_wishlist rs-template-card-12__wishlist" type="button"></button>
              <div class="rs-template-card-12__image-count">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
                <span class="rs_card_image_count"></span>
              </div>
            </div>
            <span class="rs-template-card-12__read-more">Read More</span>
            <div class="rs-template-card-12__content">
              <div class="rs-template-card-12__price-ref-row">
                <span class="rs_card_price rs-template-card-12__price"></span>
                <span class="rs_card_ref rs-template-card-12__ref"></span>
              </div>
              <h3 class="rs_card_title rs-template-card-12__title"></h3>
              <p class="rs_card_description rs-template-card-12__description"></p>
              <div class="rs-template-card-12__specs">
                <div class="rs-template-card-12__spec">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M2 4v16"></path>
                    <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                    <path d="M2 17h20"></path>
                    <path d="M6 8v9"></path>
                  </svg>
                  <span class="rs_card_beds"></span>
                </div>
                <div class="rs-template-card-12__spec">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"></path>
                    <path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"></path>
                    <circle cx="12" cy="5" r="2"></circle>
                  </svg>
                  <span class="rs_card_baths"></span>
                </div>
                <div class="rs-template-card-12__spec">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="9" y1="21" x2="9" y2="9"></line>
                  </svg>
                  <span class="rs_card_built"></span>
                </div>
                <div class="rs-template-card-12__spec">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6l9-4 9 4v12l-9 4-9-4V6z"></path>
                    <path d="M12 2v20"></path>
                  </svg>
                  <span class="rs_card_plot"></span>
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
      <div class="rs_pagination" style="margin-top: 30px;"></div>
    `
  };
  function C() {
    console.log("[RealtySoft] renderTemplates() - scanning for template elements...");
    for (const [h, g] of Object.entries(S)) {
      const m = document.querySelectorAll(`.${h}`);
      console.log(
        `[RealtySoft] Looking for .${h}: found ${m.length} element(s)`
      ), m.forEach((v) => {
        var P;
        if (!v.dataset.rsTemplateRendered) {
          if (h.includes("search")) {
            v.id || (v.id = "rs_search");
            const R = (P = h.match(/template-(\d+)/)) == null ? void 0 : P[1];
            R && v.classList.add(`rs-template-search-${R.padStart(2, "0")}`);
          }
          if (h.includes("listing") && (v.id || (v.id = "rs_listing")), v.innerHTML = g, v.dataset.rsTemplateRendered = "true", v.dataset.rsColumns) {
            const R = v.querySelector(".rs_property_grid");
            R && (R.dataset.rsColumns = v.dataset.rsColumns);
          }
          h === "rs-search-template-02" && k(v), h === "rs-search-template-03" && L(v), console.log(`[RealtySoft] Auto-rendered template: ${h}`);
        }
      });
    }
  }
  function k(h) {
    const g = h.querySelector(
      ".rs-template-search-02__more-filters-wrapper"
    ), m = h.querySelector(
      ".rs-template-search-02__more-filters-btn"
    ), v = h.querySelector(".rs-template-search-02__dropdown"), P = h.querySelector(
      ".rs-template-search-02__dropdown-close"
    );
    if (!m || !v || !g) return;
    function R() {
      v.classList.add("is-open"), m.classList.add("is-active"), g.classList.add("is-active"), window.innerWidth <= 768 && (document.body.style.overflow = "hidden");
    }
    function q() {
      v.classList.remove("is-open"), m.classList.remove("is-active"), g.classList.remove("is-active"), document.body.style.overflow = "";
    }
    m.addEventListener("click", function(B) {
      B.stopPropagation(), v.classList.contains("is-open") ? q() : R();
    }), P && P.addEventListener("click", q), document.addEventListener("click", function(B) {
      !v.contains(B.target) && !m.contains(B.target) && q();
    }), g.addEventListener("click", function(B) {
      (B.target === g || B.target.classList.contains(
        "rs-template-search-02__more-filters-wrapper"
      )) && window.innerWidth <= 768 && !v.contains(B.target) && !m.contains(B.target) && q();
    }), v.addEventListener("click", function(B) {
      B.stopPropagation();
    }), document.addEventListener("keydown", function(B) {
      B.key === "Escape" && v.classList.contains("is-open") && q();
    });
  }
  function L(h) {
    const g = h.querySelectorAll(".rs-template-search-03__tab");
    if (!g.length) return;
    g.forEach((v) => {
      v.addEventListener("click", function() {
        g.forEach((R) => R.classList.remove("is-active")), this.classList.add("is-active");
        const P = this.dataset.listingType;
        P && (D.set("filters.listingType", P), console.log(`[RealtySoft] Template 03: Tab switched to "${P}"`));
      });
    });
    const m = h.querySelector(
      ".rs-template-search-03__tab.is-active"
    );
    m && m.dataset.listingType && (D.set("filters.listingType", m.dataset.listingType), console.log(
      `[RealtySoft] Template 03: Initial listing type set to "${m.dataset.listingType}"`
    ));
  }
  function f() {
    const h = document.getElementById("rs_search"), g = document.getElementById("rs_listing");
    if (h && !h.querySelector(".rs-search-skeleton")) {
      const m = document.createElement("div");
      m.className = "rs-search-skeleton", m.innerHTML = `
        <div class="rs-search-skeleton__item">
          <div class="rs-search-skeleton__label"></div>
          <div class="rs-search-skeleton__input"></div>
        </div>
        <div class="rs-search-skeleton__item">
          <div class="rs-search-skeleton__label"></div>
          <div class="rs-search-skeleton__input"></div>
        </div>
        <div class="rs-search-skeleton__item">
          <div class="rs-search-skeleton__label"></div>
          <div class="rs-search-skeleton__input"></div>
        </div>
        <div class="rs-search-skeleton__item">
          <div class="rs-search-skeleton__label"></div>
          <div class="rs-search-skeleton__input"></div>
        </div>
        <div class="rs-search-skeleton__item">
          <div class="rs-search-skeleton__button"></div>
        </div>
      `, h.insertBefore(m, h.firstChild);
    }
    if (g && !g.querySelector(".rs-listing-skeleton")) {
      const m = document.createElement("div");
      m.className = "rs-listing-skeleton";
      for (let v = 0; v < 6; v++)
        m.innerHTML += `
          <div class="rs-listing-skeleton__card">
            <div class="rs-listing-skeleton__image"></div>
            <div class="rs-listing-skeleton__content">
              <div class="rs-listing-skeleton__price"></div>
              <div class="rs-listing-skeleton__title"></div>
              <div class="rs-listing-skeleton__location"></div>
              <div class="rs-listing-skeleton__specs">
                <div class="rs-listing-skeleton__spec"></div>
                <div class="rs-listing-skeleton__spec"></div>
                <div class="rs-listing-skeleton__spec"></div>
              </div>
            </div>
          </div>
        `;
      g.insertBefore(m, g.firstChild);
    }
  }
  function u() {
    const h = document.querySelector(".rs-search-skeleton"), g = document.querySelector(".rs-listing-skeleton");
    h && h.remove(), g && g.remove();
    const m = document.getElementById("rs_search"), v = document.getElementById("rs_listing");
    m && m.classList.add("rs-loaded"), v && v.classList.add("rs-loaded");
  }
  function b(h) {
    const g = h || "/realtysoft-sw.js";
    navigator.serviceWorker.register(g).then((m) => {
      console.log("[RealtySoft] Service worker registered:", m.scope);
    }).catch((m) => {
      console.warn("[RealtySoft] Service worker registration failed:", m);
    });
  }
  async function M() {
    return t || (t = (async () => {
      try {
        f(), D.set("ui.loading", !0);
        const h = window.RealtySoftConfig || {};
        let g = null;
        try {
          g = localStorage.getItem("rs_language");
        } catch {
        }
        const m = h.language || g || pe.init();
        pe.setLanguage(m), se.init({
          language: m,
          apiKey: h.apiKey,
          apiUrl: h.apiUrl,
          cache: h.cache
        });
        const v = Y(), P = !!v;
        P && v && se.prefetchProperty(v, !0), h.analytics !== !1 && ue.init({
          enabled: !0,
          debug: h.debug || !1
        }), D.set("config.language", m), D.set("config.ownerEmail", h.ownerEmail || null), D.set("config.privacyPolicyUrl", h.privacyPolicyUrl || null), D.set("config.defaultCountryCode", h.defaultCountryCode || "+34"), D.set(
          "config.inquiryThankYouMessage",
          h.inquiryThankYouMessage || null
        ), D.set("config.inquiryThankYouUrl", h.inquiryThankYouUrl || null), D.set("config.propertyPageSlug", h.propertyPageSlug || "property"), D.set(
          "config.useWidgetPropertyTemplate",
          h.useWidgetPropertyTemplate !== !1
        ), D.set("config.useQueryParamUrls", h.useQueryParamUrls === !0), D.set("config.propertyUrlFormat", h.propertyUrlFormat || "seo"), D.set("config.resultsPage", h.resultsPage || "/properties");
        const R = [
          se.getLabels().catch(() => ({ labels: {} }))
        ], q = se.getAllLabels().catch(() => null);
        P || R.push(
          se.getLocations().catch(() => ({ data: [] })),
          se.getPropertyTypes().catch(() => ({ data: [] })),
          q
        );
        const B = await Promise.all(R), H = B[0], re = P ? { data: [] } : B[1], ee = P ? { data: [] } : B[2], J = P ? null : B[3];
        try {
          const de = s(H, m);
          if (Object.keys(de).length > 0 ? await pe.loadFromAPI(de) : console.log("[RealtySoft] No labels from API, using defaults"), h.labelOverrides && pe.applyOverrides(h.labelOverrides), D.set("data.labels", pe.getAll()), J) {
            const ae = i(J);
            D.set("data.availableLanguages", ae), console.log("[RealtySoft] Available languages from API:", ae);
          } else P && (D.set("data.availableLanguages", []), q.then((ae) => {
            const ve = i(ae);
            D.set("data.availableLanguages", ve), console.log("[RealtySoft] Available languages loaded (deferred):", ve);
          }));
          D.set("data.locations", re.data || []), D.set("data.propertyTypes", ee.data || []), D.set("data.features", []), D.set("data.featuresLoaded", !1), C(), p = a(), console.log("[RealtySoft] Widget mode:", p), y();
          const oe = document.getElementById("rs_search"), he = document.getElementById("rs_listing");
          let V = {};
          if (he && !he.hasAttribute("data-rs-standalone")) {
            const ae = r(he);
            V = { ...V, ...ae };
          }
          if (oe) {
            const ae = r(oe);
            V = { ...V, ...ae };
          }
          Object.keys(V).length > 0 && D.setLockedFilters(V);
        } catch (de) {
          console.error("[RealtySoft] Data processing error (continuing with component init):", de);
        }
        return z(), u(), Se.init(), (p === "combined" || p === "results-only") && U(), te(), h.serviceWorker && "serviceWorker" in navigator && b(h.serviceWorkerUrl), e = !0, document.dispatchEvent(new CustomEvent("realtysoft:ready")), !0;
      } catch (h) {
        throw console.error("RealtySoft initialization failed:", h), document.dispatchEvent(new CustomEvent("realtysoft:error", { detail: h })), h;
      }
    })(), t);
  }
  function z() {
    const h = Object.keys(_).map((g) => `.${g}`).join(", ");
    h && document.querySelectorAll(h).forEach((g) => {
      for (const [m, v] of Object.entries(_))
        if (g.classList.contains(m)) {
          const P = g.dataset.rsVariation || "1";
          console.log(`[RealtySoft] Initializing ${m} with variation: ${P}`);
          const R = new v(g, { variation: P });
          n.push(R), g._rsComponent = R;
          break;
        }
    });
  }
  function W(h, g) {
    _[h] = g;
  }
  function G(h) {
    return h._rsComponent;
  }
  async function U() {
    if (p === "search-only") {
      const h = D.get("filters"), g = d(h);
      console.log("[RealtySoft] Search-only mode: redirecting to", g), window.location.href = g;
      return;
    }
    D.set("ui.loading", !0), D.set("ui.error", null);
    try {
      const h = D.getSearchParams(), g = await se.searchProperties(h), m = g, v = g.data || [], P = g.total || g.count || v.length || 0, R = h, q = R.per_page || R.limit || 12, B = m.total_pages || Math.ceil(P / q) || 0;
      return D.setMultiple({
        "results.properties": v,
        "results.total": P,
        "results.totalPages": B,
        "ui.loading": !1
      }), ue.trackSearch(), document.dispatchEvent(
        new CustomEvent("realtysoft:search", {
          detail: { results: g }
        })
      ), g;
    } catch (h) {
      throw D.set("ui.loading", !1), D.set("ui.error", h.message), h;
    }
  }
  async function te() {
    const h = document.querySelectorAll(
      '#rs_listing[data-rs-standalone], [class*="rs-listing-template-"][data-rs-standalone]'
    );
    if (h.length)
      for (const g of Array.from(h))
        try {
          const m = r(g), v = {};
          m.location && (v.location_id = m.location), m.listingType && (v.listing_type = m.listingType), m.propertyType && (v.type_id = m.propertyType), m.bedsMin && (v.bedrooms_min = m.bedsMin), m.bedsMax && (v.bedrooms_max = m.bedsMax), m.bathsMin && (v.bathrooms_min = m.bathsMin), m.bathsMax && (v.bathrooms_max = m.bathsMax), m.priceMin && (v.list_price_min = m.priceMin), m.priceMax && (v.list_price_max = m.priceMax), m.builtMin && (v.build_size_min = m.builtMin), m.builtMax && (v.build_size_max = m.builtMax), m.plotMin && (v.plot_size_min = m.plotMin), m.plotMax && (v.plot_size_max = m.plotMax), m.features && (v.features = m.features.join(",")), m.ref && (v.ref_no = m.ref), v.limit = parseInt(g.dataset.rsLimit || "6", 10), v.page = 1, v.order = g.dataset.rsOrder || "create_date_desc";
          const R = (await se.searchProperties(v)).data || [], q = g.querySelector(".rs_property_grid");
          if (q && q._rsComponent) {
            const B = q._rsComponent;
            typeof B.setStandaloneProperties == "function" && B.setStandaloneProperties(R);
          }
          console.log("[RealtySoft] Standalone listing loaded:", R.length, "properties");
        } catch (m) {
          console.error("[RealtySoft] Standalone listing error:", m);
        }
  }
  function E(h) {
    var v, P;
    const g = window.RealtySoftConfig || {};
    if (!g.wpRestUrl) return;
    const m = {
      "Content-Type": "application/json"
    };
    g.wpApiNonce && (m["X-WP-Nonce"] = g.wpApiNonce), g.wpOgToken && (m["X-RS-OG-Token"] = g.wpOgToken), fetch(g.wpRestUrl + "og-cache", {
      method: "POST",
      headers: m,
      body: JSON.stringify({
        ref: h.ref || h.unique_ref,
        title: h.title,
        description: (h.short_description || h.description || "").substring(0, 300),
        image: ((v = h.imagesFull) == null ? void 0 : v[0]) || ((P = h.images) == null ? void 0 : P[0]) || "",
        price: pe.formatPrice(h.price),
        location: h.location || "",
        site_name: g.siteName || ""
      })
    }).then((R) => {
      R.ok ? console.log("[RealtySoft] OG cache updated for:", h.ref || h.unique_ref) : console.warn("[RealtySoft] OG cache POST failed:", R.status, R.statusText);
    }).catch((R) => console.warn("[RealtySoft] OG cache POST error:", R));
  }
  async function N(h) {
    D.set("ui.loading", !0);
    try {
      const g = await se.getProperty(h), m = g.data || g;
      return D.set("currentProperty", m), D.set("ui.loading", !1), E(m), ue.trackPropertyView(m), document.dispatchEvent(
        new CustomEvent("realtysoft:property-loaded", {
          detail: { property: m }
        })
      ), m;
    } catch (g) {
      throw D.set("ui.loading", !1), D.set("ui.error", g.message), g;
    }
  }
  async function K(h) {
    D.set("ui.loading", !0);
    try {
      const g = await se.getPropertyByRef(h), m = g.data || g;
      return D.set("currentProperty", m), D.set("ui.loading", !1), E(m), ue.trackPropertyView(m), document.dispatchEvent(
        new CustomEvent("realtysoft:property-loaded", {
          detail: { property: m }
        })
      ), m;
    } catch (g) {
      throw D.set("ui.loading", !1), D.set("ui.error", g.message), g;
    }
  }
  function ie() {
    D.resetFilters();
  }
  function X(h) {
    D.set("results.page", h), ue.trackPagination(
      h,
      D.get("results.totalPages")
    ), U();
  }
  function ce(h) {
    D.set("ui.sort", h), D.set("results.page", 1), ue.trackSortChange(h), U();
  }
  function c(h) {
    D.set("ui.view", h), ue.trackViewToggle(h);
  }
  function x(h, g) {
    console.log("[RealtySoft] setFilter called:", h, "=", g), D.isFilterLocked(h) ? console.log("[RealtySoft] setFilter BLOCKED - filter is locked:", h) : (D.set(`filters.${h}`, g), ue.trackFilterChange(h, g));
  }
  function $() {
    return D.getState();
  }
  function F(h, g) {
    return D.subscribe(h, g);
  }
  function j() {
    return e;
  }
  function Y() {
    const h = window.location.pathname, m = (window.RealtySoftConfig || {}).propertyPageSlug || "property", v = new URLSearchParams(window.location.search), P = v.get("ref") || v.get("reference");
    if (P) return P.trim();
    const R = new RegExp(`/${m}/(.+?)/?$`, "i"), q = h.match(R);
    if (!q) return null;
    const B = q[1], H = B.split("-");
    if (H.length > 1) {
      const re = H[H.length - 1];
      if (/^[A-Z0-9]{3,}$/i.test(re)) return re;
    }
    return /^[A-Z0-9]{3,}$/i.test(B) ? B : null;
  }
  function Z() {
    const h = (document.body.innerText || "").toLowerCase(), g = (document.title || "").toLowerCase(), m = [
      "404",
      "not found",
      "page not found",
      "error",
      "pagina no encontrada",
      "seite nicht gefunden",
      "page introuvable",
      "pagina non trovata"
    ];
    for (const q of m)
      if (g.includes(q))
        return !0;
    const v = [
      "404",
      "not found",
      "page not found",
      "page doesn't exist",
      "page does not exist",
      "couldn't find",
      "could not find",
      "no longer exists",
      "has been removed",
      "has been deleted",
      "oops!",
      "sorry, we couldn't",
      "pagina no encontrada",
      "no se encuentra"
    ];
    for (const q of v)
      if (h.includes(q))
        return !0;
    const P = document.querySelector('meta[name="status"]');
    if (P && P.content === "404")
      return !0;
    const R = [
      ".error-404",
      "#error-404",
      ".page-404",
      ".not-found",
      ".error-page",
      '[class*="404"]',
      '[id*="404"]'
    ];
    for (const q of R)
      if (document.querySelector(q))
        return !0;
    return !1;
  }
  function Q(h) {
    console.log("[RealtySoft] Auto-detected property URL, ref:", h);
    const g = Z();
    g && console.log("[RealtySoft] Detected 404/error page, will replace content");
    const m = [
      ".entry-content",
      ".page-content",
      ".post-content",
      ".single-content",
      "article",
      ".content",
      "#content",
      ".main-content",
      ".site-content",
      "#primary",
      "#main",
      "main"
    ];
    let v = null, P = !1;
    for (const H of m)
      if (v = document.querySelector(H), v) {
        console.log(`[RealtySoft] Found container: ${H}`);
        break;
      }
    if (!v) {
      const H = document.querySelector("h1, h2.page-title, h2.entry-title");
      H && H.parentElement && H.parentElement !== document.body && (v = H.parentElement, P = !0, console.log(`[RealtySoft] Using heading parent as container: <${v.tagName.toLowerCase()}>`));
    }
    if (v || (v = document.body, P = !0, console.log("[RealtySoft] Using body as container")), g) {
      console.log("[RealtySoft] Clearing 404 content..."), v.innerHTML = "";
      const H = document.createElement("div");
      H.className = "rs-auto-injected-wrapper", H.style.cssText = "max-width: 1400px; margin: 0 auto; padding: 20px;", v.appendChild(H), v = H;
      const re = window.RealtySoftConfig || {}, ee = document.title;
      document.title = re.detailPageTitle || "Property Details", console.log(
        `[RealtySoft] Updated page title from "${ee}" to "${document.title}"`
      );
      const J = document.querySelector(
        'meta[name="description"]'
      );
      J && (J.content = `Property details for ${h}`), window.history && window.history.replaceState && window.history.replaceState({ propertyRef: h }, document.title, window.location.href);
    }
    if (!g)
      if (!P)
        v.innerHTML = "";
      else {
        const H = document.createElement("style");
        H.id = "rs-auto-inject-hide", H.textContent = ".rs-auto-inject-hidden { display: none !important; }", document.head.appendChild(H), Array.from(v.children).forEach((re) => {
          const ee = re, J = ee.tagName.toLowerCase();
          J === "nav" || J === "header" || J === "footer" || J === "aside" || J === "script" || J === "style" || J === "link" || J === "noscript" || ee.id === "rs-early-hide" || ee.getAttribute("role") === "navigation" || ee.getAttribute("role") === "banner" || ee.getAttribute("role") === "contentinfo" || ee.classList.add("rs-auto-inject-hidden");
        });
      }
    const R = document.createElement("div");
    R.className = "property-detail-container", R.id = "property-detail-container", R.dataset.propertyRef = h, R.dataset.rsAutoInjected = "true", R.innerHTML = `
      <div class="rs-detail-loading" style="text-align: center; padding: 60px 20px;">
        <div class="rs-spinner" style="width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top: 3px solid #3498db; border-radius: 50%; animation: rs-spin 1s linear infinite; margin: 0 auto;"></div>
        <p style="margin-top: 20px; color: #666;">Loading property details...</p>
      </div>
      <style>
        @keyframes rs-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `, v.appendChild(R), console.log("[RealtySoft] Auto-injected rs_detail container successfully"), window._rsAutoInjectedRef = h, document.body.classList.add("rs-property-ready");
    const q = document.getElementById("rs-early-hide");
    q && q.remove();
    const B = document.getElementById("rs-loading-overlay");
    return B && B.remove(), setTimeout(() => {
      R.querySelector(".rs-detail-loading") && (console.error("[RealtySoft] Auto-inject timeout — component did not initialize"), R.innerHTML = `
          <div style="text-align: center; padding: 60px 20px;">
            <div style="width: 48px; height: 48px; margin: 0 auto 16px; border-radius: 50%; border: 2px solid #e74c3c; display: flex; align-items: center; justify-content: center;">
              <span style="color: #e74c3c; font-weight: bold; font-size: 20px;">!</span>
            </div>
            <p style="color: #666; margin-bottom: 16px;">Failed to load property details</p>
            <button onclick="window.location.reload()" style="padding: 10px 24px; background: #3498db; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">Try Again</button>
          </div>
        `);
    }, 1e4), !0;
  }
  function w() {
    const h = Y();
    if (h) {
      const v = document.querySelector(".rs_detail"), P = document.querySelector(".property-detail-container") || document.querySelector("#property-detail-container");
      if (v && v.children.length === 0 && !P) {
        console.log("[RealtySoft] Found empty .rs_detail — upgrading to property-detail-container"), v.classList.remove("rs_detail"), v.classList.add("property-detail-container"), v.id = "property-detail-container", v.dataset.propertyRef = h, document.body.classList.add("rs-property-ready");
        const R = document.getElementById("rs-early-hide");
        R && R.remove();
        const q = document.getElementById("rs-loading-overlay");
        q && q.remove();
      } else !v && !P && Q(h);
      return !0;
    }
    if (document.querySelector('[class^="rs_"]') || document.getElementById("rs_search") || document.getElementById("rs_listing") || document.querySelector(".rs-search-template-01") || document.querySelector(".rs-search-template-02") || document.querySelector(".rs-search-template-03") || document.querySelector(".rs-search-template-04") || document.querySelector(".rs-search-template-05") || document.querySelector(".rs-search-template-06") || document.querySelector(".rs-listing-template-01") || document.querySelector(".rs-listing-template-02") || document.querySelector(".rs-listing-template-03") || document.querySelector(".rs-listing-template-04") || document.querySelector(".rs-listing-template-05") || document.querySelector(".rs-listing-template-06") || document.querySelector(".rs-listing-template-07") || document.querySelector(".rs-listing-template-08") || document.querySelector(".rs-listing-template-09") || document.querySelector(".rs-listing-template-10") || document.querySelector(".rs-listing-template-11") || document.querySelector(".rs-listing-template-12"))
      return !0;
    document.body.classList.add("rs-property-ready");
    const g = document.getElementById("rs-early-hide");
    g && g.remove();
    const m = document.getElementById("rs-loading-overlay");
    return m && m.remove(), !1;
  }
  if (document.readyState === "loading") {
    const g = (window.RealtySoftConfig || {}).propertyPageSlug || "property";
    (new RegExp("/" + g + "/[^/]+", "i").test(window.location.pathname) || /[?&]ref(erence)?=/i.test(window.location.search)) && document.body ? w() && M() : document.addEventListener("DOMContentLoaded", () => {
      w() && M();
    });
  } else
    setTimeout(() => {
      w() && M();
    }, 0);
  function T() {
    return p;
  }
  async function O(h) {
    console.log("[RealtySoft] Changing language to:", h), await pe.reloadForLanguage(h), D.set("config.language", h);
    const g = window.RealtySoftConfig || {};
    se.init({
      language: h,
      apiKey: g.apiKey,
      apiUrl: g.apiUrl,
      cache: g.cache
    }), se.clearCache("labels_" + h);
    try {
      const m = await se.getLabels(), v = s(m, h);
      Object.keys(v).length > 0 && await pe.loadFromAPI(v), g.labelOverrides && pe.applyOverrides(g.labelOverrides), D.set("data.labels", pe.getAll()), console.log(
        "[RealtySoft] Re-rendering",
        n.length,
        "components with new labels"
      );
      for (const P of n)
        if (P && typeof P.render == "function")
          try {
            P.render(), typeof P.bindEvents == "function" && P.bindEvents();
          } catch (R) {
            console.warn("[RealtySoft] Error re-rendering component:", R);
          }
      console.log("[RealtySoft] Language changed successfully to:", h);
    } catch (m) {
      console.error("[RealtySoft] Error loading labels for language:", h, m);
    }
  }
  return {
    init: M,
    registerComponent: W,
    getComponent: G,
    search: U,
    loadProperty: N,
    loadPropertyByRef: K,
    reset: ie,
    goToPage: X,
    setSort: ce,
    setView: c,
    setFilter: x,
    getState: $,
    subscribe: F,
    isReady: j,
    getMode: T,
    setLanguage: O,
    // Expose sub-modules
    State: D,
    API: se,
    Labels: pe,
    Analytics: ue,
    Router: Se
  };
}();
typeof window < "u" && (window.RealtySoft = Xe);
class A {
  constructor(n, e = {}) {
    o(this, "element");
    o(this, "options");
    o(this, "variation");
    o(this, "subscriptions");
    this.element = n, this.options = e, this.variation = e.variation || "1", this.subscriptions = [], this.element.dataset.rsInit = "true";
  }
  /**
   * Initialize component - override in subclass
   */
  init() {
    this.render(), this.bindEvents();
  }
  /**
   * Render component - override in subclass
   */
  render() {
  }
  /**
   * Bind events - override in subclass
   */
  bindEvents() {
  }
  /**
   * Subscribe to state changes
   */
  subscribe(n, e) {
    const t = RealtySoftState.subscribe(n, e);
    return this.subscriptions.push(t), t;
  }
  /**
   * Get label
   */
  label(n, e) {
    return RealtySoftLabels.get(n, e);
  }
  /**
   * Check if this filter is locked
   */
  isLocked(n) {
    return RealtySoftState.isFilterLocked(n);
  }
  /**
   * Apply locked/disabled styles to element
   * Shows the filter but prevents interaction
   */
  applyLockedStyle() {
    this.element.classList.add("rs-filter--locked"), this.element.setAttribute("title", "This filter is pre-set for this page");
  }
  /**
   * Get locked filter value
   */
  getLockedValue(n) {
    return (RealtySoftState.get("lockedFilters") || {})[n];
  }
  /**
   * Set filter value
   */
  setFilter(n, e) {
    RealtySoft.setFilter(n, e);
  }
  /**
   * Get filter value
   */
  getFilter(n) {
    return RealtySoftState.get(`filters.${n}`);
  }
  /**
   * Create element helper
   */
  createElement(n, e, t = "") {
    const s = document.createElement(n);
    return e && (s.className = e), t && (s.innerHTML = t), s;
  }
  /**
   * Destroy component
   */
  destroy() {
    this.subscriptions.forEach((n) => n()), this.subscriptions = [], this.element.innerHTML = "", delete this.element._rsComponent, delete this.element.dataset.rsInit;
  }
}
typeof window < "u" && (window.RSBaseComponent = A);
function ye(_) {
  const n = _.property_count;
  return n === 0 && console.log(`[RealtySoft] Filtering out location with 0 properties: ${_.name} (id: ${_.id})`), n == null ? !0 : n > 0;
}
function Me(_, n) {
  const e = ye(_), t = (r) => {
    const a = n.filter((d) => {
      const y = d.parent_id;
      return !y && y !== 0 ? !1 : String(y) === String(r);
    });
    let l = [...a];
    return a.forEach((d) => {
      l = l.concat(t(d.id));
    }), l;
  }, i = t(_.id).some((r) => ye(r));
  return e || i;
}
class Qe extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "lockedMode", !1);
    o(this, "locations", []);
    o(this, "selectedLocations", /* @__PURE__ */ new Set());
    o(this, "selectedLocation", null);
    o(this, "selectedName", "");
    o(this, "isOpen", !1);
    o(this, "searchTerm", "");
    o(this, "filteredLocations", []);
    o(this, "highlightIndex", -1);
    // For variation 2 (two dropdowns)
    o(this, "selectedParents", /* @__PURE__ */ new Set());
    o(this, "selectedChildren", /* @__PURE__ */ new Set());
    o(this, "parentType", "municipality");
    o(this, "childType", "city");
    o(this, "parentLabel", "");
    o(this, "childLabel", "");
    // DOM elements
    o(this, "input", null);
    o(this, "dropdown", null);
    o(this, "list", null);
    o(this, "clearBtn", null);
    o(this, "select", null);
    o(this, "multiBtn", null);
    o(this, "filterInput", null);
    o(this, "hierarchyList", null);
    o(this, "tagsContainer", null);
    // For variation 2
    o(this, "parentBtn", null);
    o(this, "parentDropdown", null);
    o(this, "parentList", null);
    o(this, "parentFilter", null);
    o(this, "childBtn", null);
    o(this, "childDropdown", null);
    o(this, "childList", null);
    o(this, "childFilter", null);
    this.init();
  }
  init() {
    this.lockedMode = this.isLocked("location"), this.locations = RealtySoftState.get("data.locations") || [];
    const e = this.locations.filter((s) => s.property_count === 0), t = this.locations.filter((s) => s.property_count === void 0 || s.property_count === null);
    if (console.log(`[RealtySoft] Location init: ${this.locations.length} locations, ${e.length} with count=0, ${t.length} with count=undefined`), e.length > 0 && console.log(`[RealtySoft] Zero-count: ${e.slice(0, 15).map((s) => `${s.name}(id:${s.id})`).join(", ")}`), this.selectedLocations = /* @__PURE__ */ new Set(), this.selectedLocation = this.getFilter("location"), this.selectedName = this.getFilter("locationName") || "", this.isOpen = !1, this.searchTerm = "", this.filteredLocations = [], this.highlightIndex = -1, this.selectedParents = /* @__PURE__ */ new Set(), this.selectedChildren = /* @__PURE__ */ new Set(), this.parentType = this.element.dataset.rsParentType || "municipality", this.childType = this.element.dataset.rsChildType || "city", this.lockedMode) {
      const s = this.getFilter("location");
      if (s) {
        const i = this.locations.find((r) => r.id == s);
        i && (this.selectedName = i.name);
      }
    }
    if (this.selectedLocation && !this.selectedName && this.locations.length > 0) {
      const s = this.locations.find((i) => i.id === this.selectedLocation);
      s && (this.selectedName = s.name, this.setFilter("locationName", s.name));
    }
    this.render(), this.lockedMode ? this.applyLockedStyle() : this.bindEvents(), this.selectedLocation && this.updateDisplay(), this.subscribe("data.locations", (s) => {
      this.locations = s;
      const i = s.filter((a) => a.property_count === 0), r = s.filter((a) => a.property_count === void 0 || a.property_count === null);
      if (console.log(`[RealtySoft] Location data: ${s.length} total, ${i.length} with count=0, ${r.length} with count=undefined`), i.length > 0 && console.log(`[RealtySoft] Zero-count locations: ${i.slice(0, 10).map((a) => `${a.name}(id:${a.id},type:${a.type})`).join(", ")}${i.length > 10 ? "..." : ""}`), this.selectedLocation && !this.selectedName) {
        const a = this.locations.find((l) => l.id === this.selectedLocation);
        a && (this.selectedName = a.name, this.setFilter("locationName", a.name), this.updateDisplay());
      }
      this.updateLocationData();
    }), this.subscribe("filters.location", (s) => {
      this.selectedLocation = s, this.updateDisplay();
    });
  }
  getParentLocations() {
    const e = this.locations.filter(
      (i) => i.type && i.type.toLowerCase() === this.parentType.toLowerCase()
    );
    let t = e.filter((i) => Me(i, this.locations));
    this.variation === "2" && (t = t.filter((i) => this.locations.filter((a) => {
      const l = a.parent_id;
      if (!l && l !== 0) return !1;
      const d = String(l) === String(i.id), y = a.type && a.type.toLowerCase() === this.childType.toLowerCase();
      return d && y && ye(a);
    }).length > 0));
    const s = e.filter((i) => !t.includes(i));
    return console.log(`[RealtySoft] Location parents: ${e.length} total, ${t.length} after filtering, ${s.length} filtered out`), s.length > 0 && console.log(`[RealtySoft] Filtered out parents: ${s.map((i) => `${i.name}(id:${i.id},count:${i.property_count})`).join(", ")}`), t.sort((i, r) => (i.name || "").localeCompare(r.name || ""));
  }
  getChildLocations(e) {
    var a;
    const t = this.locations.find((l) => String(l.id) === String(e)), s = ((a = t == null ? void 0 : t.name) == null ? void 0 : a.toLowerCase().trim()) || "", i = this.locations.filter((l) => {
      const d = l.parent_id, y = d && String(d) === String(e), p = l.type && l.type.toLowerCase() === this.childType.toLowerCase();
      return y && p;
    }), r = i.filter((l) => {
      var p;
      const d = ye(l), y = ((p = l.name) == null ? void 0 : p.toLowerCase().trim()) === s;
      return d && !y;
    });
    return console.log(`[RealtySoft] Child locations for parent ${e}: ${i.length} total, ${r.length} after filtering`), r.sort((l, d) => (l.name || "").localeCompare(d.name || ""));
  }
  // Get all descendants of a location (recursive)
  getAllDescendants(e) {
    const t = [];
    return this.locations.filter((i) => {
      const r = i.parent_id;
      return r && String(r) === String(e);
    }).forEach((i) => {
      t.push(i), t.push(...this.getAllDescendants(i.id));
    }), t;
  }
  getAllLocationsFlat() {
    const e = [], t = (s, i) => {
      this.locations.filter((a) => {
        const l = a.parent_id;
        let d = !1;
        return s === null ? d = l == null || l === 0 || String(l) === "0" || String(l) === "" : d = l && String(l) === String(s), d && ye(a);
      }).sort((a, l) => (a.name || "").localeCompare(l.name || "")).forEach((a) => {
        e.push({ ...a, level: i }), t(a.id, i + 1);
      });
    };
    return t(null, 0), e.length === 0 && this.locations.length > 0 ? [...this.locations].filter((s) => ye(s)).sort((s, i) => (s.name || "").localeCompare(i.name || "")) : e;
  }
  render() {
    switch (console.log(`[RealtySoft] Location render() - variation: ${this.variation}`), this.element.classList.add("rs-location", `rs-location--v${this.variation}`), this.variation) {
      case "2":
        console.log("[RealtySoft] Location: rendering Two Dropdowns"), this.renderTwoDropdowns();
        break;
      case "3":
        console.log("[RealtySoft] Location: rendering Hierarchical MultiSelect"), this.renderHierarchicalMultiSelect();
        break;
      case "4":
        console.log("[RealtySoft] Location: rendering Traditional Dropdown"), this.renderTraditionalDropdown();
        break;
      default:
        console.log("[RealtySoft] Location: rendering Typeahead"), this.renderTypeahead();
    }
  }
  // VARIATION 1: Search/Autocomplete (Typeahead)
  renderTypeahead() {
    this.element.innerHTML = `
      <div class="rs-location__wrapper">
        <label class="rs-location__label">${this.label("search_location")}</label>
        <div class="rs-location__input-wrapper">
          <input type="text"
                 class="rs-location__input"
                 placeholder="Enter location name"
                 value="${this.selectedName}"
                 autocomplete="off">
          ${this.selectedLocation ? '<button class="rs-location__clear" type="button">&times;</button>' : ""}
        </div>
        <div class="rs-location__dropdown" style="display: none;">
          <ul class="rs-location__list"></ul>
        </div>
      </div>
    `, this.input = this.element.querySelector(".rs-location__input"), this.dropdown = this.element.querySelector(".rs-location__dropdown"), this.list = this.element.querySelector(".rs-location__list"), this.clearBtn = this.element.querySelector(".rs-location__clear");
  }
  // VARIATION 2: Two Dropdowns (Parent + Child)
  renderTwoDropdowns() {
    var e, t;
    this.parentLabel = this.label("search_location") || "Location", this.childLabel = this.label("search_sublocation") || "Sub-location", this.element.innerHTML = `
      <div class="rs-location__wrapper rs-location__two-dropdowns">
        <label class="rs-location__label">${this.label("search_location")}</label>

        <div class="rs-location__parent-container">
          <button type="button" class="rs-location__multi-btn rs-location__parent-btn">
            ${this.parentLabel}
          </button>
          <div class="rs-location__dropdown rs-location__parent-dropdown" style="display: none;">
            <input type="text" class="rs-location__filter-input" placeholder="${this.label("search_location_placeholder") || "Search location..."}">
            <div class="rs-location__checklist rs-location__parent-list"></div>
          </div>
        </div>

        <div class="rs-location__child-container" style="margin-top: 10px;">
          <button type="button" class="rs-location__multi-btn rs-location__child-btn" disabled>
            ${this.childLabel}
          </button>
          <div class="rs-location__dropdown rs-location__child-dropdown" style="display: none;">
            <input type="text" class="rs-location__filter-input" placeholder="${this.label("search_location_placeholder") || "Search location..."}">
            <div class="rs-location__checklist rs-location__child-list"></div>
          </div>
        </div>
      </div>
    `, this.parentBtn = this.element.querySelector(".rs-location__parent-btn"), this.parentDropdown = this.element.querySelector(".rs-location__parent-dropdown"), this.parentList = this.element.querySelector(".rs-location__parent-list"), this.parentFilter = ((e = this.parentDropdown) == null ? void 0 : e.querySelector(".rs-location__filter-input")) || null, this.childBtn = this.element.querySelector(".rs-location__child-btn"), this.childDropdown = this.element.querySelector(".rs-location__child-dropdown"), this.childList = this.element.querySelector(".rs-location__child-list"), this.childFilter = ((t = this.childDropdown) == null ? void 0 : t.querySelector(".rs-location__filter-input")) || null, this.renderParentChecklist();
  }
  renderParentChecklist(e = "") {
    if (!this.parentList) return;
    const t = this.getParentLocations(), s = e ? t.filter((i) => i.name.toLowerCase().includes(e.toLowerCase())) : t;
    if (s.length === 0) {
      this.parentList.innerHTML = '<div class="rs-location__no-results">No results</div>';
      return;
    }
    this.parentList.innerHTML = s.map((i) => `
      <label class="rs-location__check-item">
        <input type="checkbox" value="${i.id}" data-name="${this.escapeHtml(i.name)}"
               ${this.selectedParents.has(String(i.id)) ? "checked" : ""}>
        <span>${this.escapeHtml(i.name)}</span>
        ${i.count ? `<span class="rs-location__count">(${i.count})</span>` : ""}
      </label>
    `).join("");
  }
  renderChildChecklist(e = "") {
    if (!this.childList) return;
    if (this.selectedParents.size === 0) {
      this.childList.innerHTML = '<div class="rs-location__no-results">Select a municipality first</div>';
      return;
    }
    let t = [];
    this.selectedParents.forEach((i) => {
      t = t.concat(this.getChildLocations(i));
    });
    const s = e ? t.filter((i) => i.name.toLowerCase().includes(e.toLowerCase())) : t;
    if (s.length === 0) {
      this.childList.innerHTML = '<div class="rs-location__no-results">No areas found</div>';
      return;
    }
    this.childList.innerHTML = s.map((i) => `
      <label class="rs-location__check-item">
        <input type="checkbox" value="${i.id}" data-name="${this.escapeHtml(i.name)}"
               ${this.selectedChildren.has(String(i.id)) ? "checked" : ""}>
        <span>${this.escapeHtml(i.name)}</span>
        ${i.count ? `<span class="rs-location__count">(${i.count})</span>` : ""}
      </label>
    `).join("");
  }
  // VARIATION 3: Hierarchical Multi-Select
  renderHierarchicalMultiSelect() {
    this.element.innerHTML = `
      <div class="rs-location__wrapper">
        <label class="rs-location__label">${this.label("search_location")}</label>
        <button type="button" class="rs-location__multi-btn">
          ${this.label("search_location") || "Location"}
        </button>
        <div class="rs-location__dropdown" style="display: none;">
          <input type="text" class="rs-location__filter-input" placeholder="${this.label("search_location_placeholder") || "Search location..."}">
          <div class="rs-location__checklist rs-location__hierarchy-list"></div>
        </div>
        <div class="rs-location__tags"></div>
      </div>
    `, this.multiBtn = this.element.querySelector(".rs-location__multi-btn"), this.dropdown = this.element.querySelector(".rs-location__dropdown"), this.filterInput = this.element.querySelector(".rs-location__filter-input"), this.hierarchyList = this.element.querySelector(".rs-location__hierarchy-list"), this.tagsContainer = this.element.querySelector(".rs-location__tags"), this.renderHierarchyChecklist();
  }
  renderHierarchyChecklist(e = "") {
    if (!this.hierarchyList) return;
    const t = this.getParentLocations();
    let s = "";
    t.forEach((i) => {
      const r = this.getChildLocations(i.id), a = !e || i.name.toLowerCase().includes(e.toLowerCase()), l = r.some((d) => d.name.toLowerCase().includes(e.toLowerCase()));
      !a && !l || (s += `
        <div class="rs-location__parent-group">
          <label class="rs-location__check-item rs-location__check-item--parent">
            <input type="checkbox" value="${i.id}" data-name="${this.escapeHtml(i.name)}" data-is-parent="true"
                   ${this.selectedLocations.has(String(i.id)) ? "checked" : ""}>
            <strong>${this.escapeHtml(i.name)}</strong>
            ${i.count ? `<span class="rs-location__count">(${i.count})</span>` : ""}
          </label>
          <div class="rs-location__children">
      `, r.forEach((d) => {
        e && !d.name.toLowerCase().includes(e.toLowerCase()) && !a || (s += `
          <label class="rs-location__check-item rs-location__check-item--child">
            <input type="checkbox" value="${d.id}" data-name="${this.escapeHtml(d.name)}" data-parent-id="${i.id}"
                   ${this.selectedLocations.has(String(d.id)) ? "checked" : ""}>
            <span>${this.escapeHtml(d.name)}</span>
            ${d.count ? `<span class="rs-location__count">(${d.count})</span>` : ""}
          </label>
        `);
      }), s += "</div></div>");
    }), this.hierarchyList.innerHTML = s || '<div class="rs-location__no-results">No locations found</div>';
  }
  // VARIATION 4: Traditional Dropdown
  renderTraditionalDropdown() {
    this.element.innerHTML = `
      <div class="rs-location__wrapper">
        <label class="rs-location__label">${this.label("search_location")}</label>
        <div class="rs-location__select-wrapper">
          <select class="rs-location__select">
            <option value="">${this.label("search_location")}</option>
          </select>
        </div>
      </div>
    `, this.select = this.element.querySelector(".rs-location__select"), this.populateTraditionalSelect();
  }
  populateTraditionalSelect() {
    if (!this.select) return;
    let e = `<option value="">${this.label("search_location")}</option>`;
    this.locations.filter((s) => s.type && s.type.toLowerCase() === this.parentType.toLowerCase() && Me(s, this.locations)).sort((s, i) => (s.name || "").localeCompare(i.name || "")).forEach((s) => {
      e += `<option value="${s.id}">${this.escapeHtml(s.name)} • ${s.type}</option>`;
      const i = /* @__PURE__ */ new Set(), r = (l) => {
        this.locations.forEach((d) => {
          d.parent_id && String(d.parent_id) === String(l) && (i.add(d.id), r(d.id));
        });
      };
      r(s.id), this.locations.filter((l) => !l.type || l.type.toLowerCase() !== this.childType.toLowerCase() || !ye(l) ? !1 : l.parent_id && String(l.parent_id) === String(s.id) || i.has(l.id)).sort((l, d) => (l.name || "").localeCompare(d.name || "")).forEach((l) => {
        e += `<option value="${l.id}">&nbsp;&nbsp;├─ ${this.escapeHtml(l.name)}</option>`;
      });
    }), this.select.innerHTML = e, this.selectedLocation && (this.select.value = String(this.selectedLocation));
  }
  bindEvents() {
    switch (this.variation) {
      case "2":
        this.bindTwoDropdownsEvents();
        break;
      case "3":
        this.bindHierarchicalEvents();
        break;
      case "4":
        this.bindTraditionalEvents();
        break;
      default:
        this.bindTypeaheadEvents();
    }
  }
  bindTypeaheadEvents() {
    if (!this.input || !this.list) return;
    let e;
    this.input.addEventListener("blur", () => {
      setTimeout(() => this.hideDropdown(), 200);
    }), this.input.addEventListener("input", (t) => {
      clearTimeout(e);
      const s = t.target;
      this.searchTerm = s.value, this.searchTerm.length >= 1 ? e = setTimeout(() => {
        this.searchLocations(this.searchTerm), this.showDropdown();
      }, 300) : this.hideDropdown();
    }), this.input.addEventListener("keydown", (t) => {
      this.handleKeyboard(t);
    }), this.list.addEventListener("click", (t) => {
      const i = t.target.closest(".rs-location__item");
      i && i.dataset.id && i.dataset.name && this.selectLocation(parseInt(i.dataset.id), i.dataset.name);
    }), this.clearBtn && this.clearBtn.addEventListener("click", () => this.clearSelection()), document.addEventListener("click", (t) => {
      this.element.contains(t.target) || this.hideDropdown();
    });
  }
  bindTwoDropdownsEvents() {
    let e, t;
    this.parentBtn && this.parentBtn.addEventListener("click", () => {
      this.toggleDropdownEl(this.parentDropdown), this.hideDropdownEl(this.childDropdown);
    }), this.childBtn && this.childBtn.addEventListener("click", () => {
      this.childBtn.disabled || (this.toggleDropdownEl(this.childDropdown), this.hideDropdownEl(this.parentDropdown));
    }), this.parentFilter && this.parentFilter.addEventListener("input", (s) => {
      clearTimeout(e), e = setTimeout(() => {
        const i = s.target;
        this.renderParentChecklist(i.value);
      }, 200);
    }), this.childFilter && this.childFilter.addEventListener("input", (s) => {
      clearTimeout(t), t = setTimeout(() => {
        const i = s.target;
        this.renderChildChecklist(i.value);
      }, 200);
    }), this.parentList && this.parentList.addEventListener("change", (s) => {
      const i = s.target;
      if (i.type === "checkbox") {
        const r = String(i.value);
        i.checked ? this.selectedParents.add(r) : (this.selectedParents.delete(r), this.getChildLocations(r).forEach((a) => {
          this.selectedChildren.delete(String(a.id));
        })), this.updateTwoDropdownsState();
      }
    }), this.childList && this.childList.addEventListener("change", (s) => {
      const i = s.target;
      if (i.type === "checkbox") {
        const r = String(i.value);
        i.checked ? this.selectedChildren.add(r) : this.selectedChildren.delete(r), this.updateTwoDropdownsState();
      }
    }), document.addEventListener("click", (s) => {
      this.element.contains(s.target) || (this.hideDropdownEl(this.parentDropdown), this.hideDropdownEl(this.childDropdown));
    });
  }
  updateTwoDropdownsState() {
    var t;
    this.selectedParents.size > 0 ? (this.parentBtn && (this.parentBtn.textContent = this.selectedParents.size + " selected", this.parentBtn.classList.add("has-selection")), this.childBtn && (this.childBtn.disabled = !1)) : (this.parentBtn && (this.parentBtn.textContent = this.parentLabel || this.label("search_location") || "Location", this.parentBtn.classList.remove("has-selection")), this.childBtn && (this.childBtn.disabled = !0, this.childBtn.textContent = this.childLabel || this.label("search_sublocation") || "Sub-location")), this.selectedChildren.size > 0 ? this.childBtn && (this.childBtn.textContent = this.selectedChildren.size + " selected", this.childBtn.classList.add("has-selection")) : this.childBtn && !this.childBtn.disabled && (this.childBtn.textContent = this.childLabel || this.label("search_sublocation") || "Sub-location", this.childBtn.classList.remove("has-selection")), this.renderChildChecklist(((t = this.childFilter) == null ? void 0 : t.value) || "");
    const e = this.selectedChildren.size > 0 ? Array.from(this.selectedChildren) : Array.from(this.selectedParents);
    e.length > 0 ? this.setFilter("location", e.join(",")) : this.setFilter("location", null);
  }
  bindHierarchicalEvents() {
    let e;
    this.multiBtn && this.multiBtn.addEventListener("click", () => {
      this.toggleDropdownEl(this.dropdown);
    }), this.filterInput && this.filterInput.addEventListener("input", (t) => {
      clearTimeout(e), e = setTimeout(() => {
        const s = t.target;
        this.renderHierarchyChecklist(s.value);
      }, 200);
    }), this.hierarchyList && this.hierarchyList.addEventListener("change", (t) => {
      var i, r;
      const s = t.target;
      if (s.type === "checkbox") {
        const a = String(s.value), l = s.dataset.isParent === "true";
        s.checked ? (this.selectedLocations.add(a), l && (this.getChildLocations(a).forEach((y) => {
          this.selectedLocations.add(String(y.id));
        }), this.renderHierarchyChecklist(((i = this.filterInput) == null ? void 0 : i.value) || ""))) : (this.selectedLocations.delete(a), l && (this.getChildLocations(a).forEach((y) => {
          this.selectedLocations.delete(String(y.id));
        }), this.renderHierarchyChecklist(((r = this.filterInput) == null ? void 0 : r.value) || ""))), this.updateHierarchicalState();
      }
    }), document.addEventListener("click", (t) => {
      this.element.contains(t.target) || this.hideDropdownEl(this.dropdown);
    });
  }
  updateHierarchicalState() {
    this.multiBtn && (this.selectedLocations.size > 0 ? (this.multiBtn.textContent = this.selectedLocations.size + " selected", this.multiBtn.classList.add("has-selection")) : (this.multiBtn.textContent = this.label("search_location") || "Location", this.multiBtn.classList.remove("has-selection"))), this.updateTags(), this.selectedLocations.size > 0 ? this.setFilter("location", Array.from(this.selectedLocations).join(",")) : this.setFilter("location", null);
  }
  updateTags() {
    if (!this.tagsContainer) return;
    const e = [];
    this.selectedLocations.forEach((t) => {
      const s = this.locations.find((i) => String(i.id) === t);
      s && e.push(`
          <span class="rs-location__tag">
            ${this.escapeHtml(s.name)}
            <button type="button" class="rs-location__tag-remove" data-id="${t}">&times;</button>
          </span>
        `);
    }), this.tagsContainer.innerHTML = e.join(""), this.tagsContainer.querySelectorAll(".rs-location__tag-remove").forEach((t) => {
      t.addEventListener("click", (s) => {
        var r;
        const i = t.dataset.id;
        i && (this.selectedLocations.delete(i), this.renderHierarchyChecklist(((r = this.filterInput) == null ? void 0 : r.value) || ""), this.updateHierarchicalState());
      });
    });
  }
  bindTraditionalEvents() {
    this.select && this.select.addEventListener("change", (e) => {
      const t = e.target, s = t.options[t.selectedIndex];
      this.setFilter("location", t.value ? parseInt(t.value) : null), this.setFilter("locationName", s.text.trim() || "");
    });
  }
  toggleDropdownEl(e) {
    e && (e.style.display === "none" ? e.style.display = "block" : e.style.display = "none");
  }
  showDropdown(e) {
    const t = e || this.dropdown;
    t && (this.isOpen = !0, t.style.display = "block");
  }
  hideDropdown(e) {
    const t = e || this.dropdown;
    t && (this.isOpen = !1, t.style.display = "none", this.highlightIndex = -1);
  }
  hideDropdownEl(e) {
    e && (e.style.display = "none");
  }
  /**
   * Search locations using client-side filtering on preloaded data
   * This is instant since all locations are already loaded
   */
  searchLocations(e) {
    if (!e || e.length < 2) {
      this.filteredLocations = this.getAllLocationsFlat().slice(0, 15), this.updateDropdownItems();
      return;
    }
    const t = e.toLowerCase();
    this.filteredLocations = this.getAllLocationsFlat().filter(
      (s) => s.name.toLowerCase().includes(t)
    ).slice(0, 20), this.updateDropdownItems();
  }
  updateDropdownItems() {
    if (this.list) {
      if (this.filteredLocations.length === 0) {
        this.list.innerHTML = `<li class="rs-location__empty">${this.label("no_results") || "No results found"}</li>`;
        return;
      }
      this.list.innerHTML = this.filteredLocations.map((e, t) => {
        const s = e.type ? e.type.toLowerCase() : "", r = s && s !== "city" ? `<span class="rs-location__type">${this.escapeHtml(e.type || "")}</span>` : "";
        return `
        <li class="rs-location__item ${e.level ? "rs-location__item--child" : ""} ${t === this.highlightIndex ? "rs-location__item--highlight" : ""}"
            data-id="${e.id}"
            data-name="${this.escapeHtml(e.name)}">
          <span class="rs-location__name">
            ${e.level ? '<span class="rs-location__indent"></span>' : ""}
            ${this.escapeHtml(e.name)}
          </span>
          ${r}
          ${e.count ? `<span class="rs-location__count">(${e.count})</span>` : ""}
        </li>
      `;
      }).join("");
    }
  }
  updateLocationData() {
    switch (this.variation) {
      case "2":
        this.renderParentChecklist();
        break;
      case "3":
        this.renderHierarchyChecklist();
        break;
      case "4":
        this.populateTraditionalSelect();
        break;
      default:
        this.filteredLocations = this.getAllLocationsFlat().slice(0, 15), this.updateDropdownItems();
    }
  }
  handleKeyboard(e) {
    if (!this.isOpen) {
      (e.key === "ArrowDown" || e.key === "Enter") && this.showDropdown();
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault(), this.highlightIndex = Math.min(this.highlightIndex + 1, this.filteredLocations.length - 1), this.updateDropdownItems();
        break;
      case "ArrowUp":
        e.preventDefault(), this.highlightIndex = Math.max(this.highlightIndex - 1, 0), this.updateDropdownItems();
        break;
      case "Enter":
        if (e.preventDefault(), this.highlightIndex >= 0 && this.filteredLocations[this.highlightIndex]) {
          const t = this.filteredLocations[this.highlightIndex];
          this.selectLocation(t.id, t.name);
        }
        break;
      case "Escape":
        this.hideDropdown();
        break;
    }
  }
  selectLocation(e, t) {
    this.selectedLocation = e, this.selectedName = t, this.setFilter("location", this.selectedLocation), this.setFilter("locationName", t), this.updateDisplay(), this.hideDropdown();
  }
  clearSelection() {
    this.selectedLocation = null, this.selectedName = "", this.setFilter("location", null), this.setFilter("locationName", ""), this.updateDisplay();
  }
  updateDisplay() {
    var t;
    this.input && (this.input.value = this.selectedName || ""), this.select && (this.select.value = ((t = this.selectedLocation) == null ? void 0 : t.toString()) || "");
    const e = this.element.querySelector(".rs-location__clear");
    if (e && (e.style.display = this.selectedLocation ? "block" : "none"), this.variation === "2")
      if (this.selectedLocation) {
        const s = this.locations.find((i) => i.id === this.selectedLocation);
        if (s) {
          const i = s.type && s.type.toLowerCase() === this.parentType.toLowerCase(), r = s.type && s.type.toLowerCase() === this.childType.toLowerCase();
          i ? this.selectedParents.add(String(s.id)) : r && s.parent_id ? (this.selectedParents.add(String(s.parent_id)), this.selectedChildren.add(String(s.id))) : this.selectedParents.add(String(s.id)), this.parentBtn && (this.parentBtn.textContent = this.selectedParents.size + " selected", this.parentBtn.classList.add("has-selection")), this.childBtn && (this.childBtn.disabled = !1, this.selectedChildren.size > 0 && (this.childBtn.textContent = this.selectedChildren.size + " selected", this.childBtn.classList.add("has-selection"))), this.renderParentChecklist(), this.renderChildChecklist();
        }
      } else
        this.selectedParents.clear(), this.selectedChildren.clear(), this.renderParentChecklist(), this.renderChildChecklist(), this.parentBtn && (this.parentBtn.textContent = this.parentLabel || this.label("search_location") || "Location", this.parentBtn.classList.remove("has-selection")), this.childBtn && (this.childBtn.textContent = this.childLabel || this.label("search_sublocation") || "Sub-location", this.childBtn.classList.remove("has-selection"), this.childBtn.disabled = !0);
    this.variation === "3" && (this.selectedLocation ? (this.selectedLocations.add(String(this.selectedLocation)), this.renderHierarchyChecklist(), this.updateTags(), this.multiBtn && (this.multiBtn.textContent = this.selectedLocations.size + " selected", this.multiBtn.classList.add("has-selection"))) : (this.selectedLocations.clear(), this.renderHierarchyChecklist(), this.updateTags(), this.multiBtn && (this.multiBtn.textContent = this.label("search_location") || "Location", this.multiBtn.classList.remove("has-selection"))));
  }
  escapeHtml(e) {
    const t = document.createElement("div");
    return t.textContent = e, t.innerHTML;
  }
}
RealtySoft.registerComponent("rs_location", Qe);
class et extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "lockedMode", !1);
    o(this, "selectedTypes", /* @__PURE__ */ new Set());
    o(this, "selected", "");
    o(this, "radioName", "");
    o(this, "select", null);
    this.init();
  }
  init() {
    this.lockedMode = this.isLocked("listingType"), this.selectedTypes = /* @__PURE__ */ new Set(), this.selected = this.getFilter("listingType") || "", this.radioName = "rs-listing-type-" + Math.random().toString(36).substr(2, 9), this.selected && (Array.isArray(this.selected) ? this.selected.forEach((e) => this.selectedTypes.add(e)) : this.selectedTypes.add(this.selected)), this.render(), this.lockedMode ? this.applyLockedStyle() : this.bindEvents(), this.subscribe("filters.listingType", (e) => {
      this.selected = e || "", this.updateDisplay();
    });
  }
  // Get listing type options
  getOptions() {
    const e = RealtySoftState.get("data.labels") || {};
    return {
      resale: e.listing_type_sale || "ReSale",
      development: e.listing_type_new || "New Development",
      long_rental: e.listing_type_long_rental || "Long Term Rental",
      short_rental: e.listing_type_short_rental || "Holiday Rental"
    };
  }
  render() {
    switch (this.element.classList.add("rs-listing-type", `rs-listing-type--v${this.variation}`), this.variation) {
      case "2":
        this.renderCheckboxes();
        break;
      case "3":
        this.renderRadioButtons();
        break;
      default:
        this.renderDropdown();
    }
  }
  // VARIATION 1: Dropdown (Single Select)
  renderDropdown() {
    const e = this.getOptions(), t = Array.isArray(this.selected) ? this.selected[0] : this.selected;
    this.element.innerHTML = `
      <div class="rs-listing-type__wrapper">
        <label class="rs-listing-type__label">${this.label("search_listing_type")}</label>
        <div class="rs-listing-type__select-wrapper">
          <select class="rs-listing-type__select">
            <option value="">${this.label("search_listing_type_all") || "All Listing Types"}</option>
            ${Object.entries(e).map(
      ([s, i]) => `<option value="${s}" ${t === s ? "selected" : ""}>${i}</option>`
    ).join("")}
          </select>
        </div>
      </div>
    `, this.select = this.element.querySelector(".rs-listing-type__select");
  }
  // VARIATION 2: Checkboxes (Multi-Select)
  renderCheckboxes() {
    const e = this.getOptions();
    this.element.innerHTML = `
      <div class="rs-listing-type__wrapper">
        <label class="rs-listing-type__label">${this.label("search_listing_type")}</label>
        <div class="rs-listing-type__checkboxes">
          ${Object.entries(e).map(([t, s]) => `
            <label class="rs-listing-type__checkbox-wrapper">
              <input type="checkbox"
                     class="rs-listing-type__checkbox"
                     value="${t}"
                     ${this.selectedTypes.has(t) ? "checked" : ""}>
              <span class="rs-listing-type__checkbox-label">${s}</span>
            </label>
          `).join("")}
        </div>
      </div>
    `;
  }
  // VARIATION 3: Radio Buttons (Single Select)
  renderRadioButtons() {
    const e = this.getOptions(), t = Array.isArray(this.selected) ? this.selected[0] : this.selected;
    this.element.innerHTML = `
      <div class="rs-listing-type__wrapper">
        <label class="rs-listing-type__label">${this.label("search_listing_type")}</label>
        <div class="rs-listing-type__radios">
          <label class="rs-listing-type__radio-wrapper">
            <input type="radio"
                   class="rs-listing-type__radio"
                   name="${this.radioName}"
                   value=""
                   ${t ? "" : "checked"}>
            <span class="rs-listing-type__radio-label">${this.label("search_all") || "All"}</span>
          </label>
          ${Object.entries(e).map(([s, i]) => `
            <label class="rs-listing-type__radio-wrapper">
              <input type="radio"
                     class="rs-listing-type__radio"
                     name="${this.radioName}"
                     value="${s}"
                     ${t === s ? "checked" : ""}>
              <span class="rs-listing-type__radio-label">${i}</span>
            </label>
          `).join("")}
        </div>
      </div>
    `;
  }
  bindEvents() {
    switch (this.variation) {
      case "2":
        this.bindCheckboxEvents();
        break;
      case "3":
        this.bindRadioEvents();
        break;
      default:
        this.bindDropdownEvents();
    }
  }
  bindDropdownEvents() {
    this.select && this.select.addEventListener("change", (e) => {
      const s = e.target.value;
      this.selected = s, this.setFilter("listingType", s || null);
    });
  }
  bindCheckboxEvents() {
    this.element.querySelectorAll(".rs-listing-type__checkbox").forEach((e) => {
      e.addEventListener("change", (t) => {
        const s = t.target, i = s.value;
        s.checked ? this.selectedTypes.add(i) : this.selectedTypes.delete(i), this.updateListingTypeFilter();
      });
    });
  }
  bindRadioEvents() {
    this.element.querySelectorAll(".rs-listing-type__radio").forEach((e) => {
      e.addEventListener("change", (t) => {
        const s = t.target;
        s.checked && (this.selected = s.value, this.setFilter("listingType", s.value || null));
      });
    });
  }
  updateListingTypeFilter() {
    this.selectedTypes.size === 0 ? this.setFilter("listingType", null) : this.selectedTypes.size === 1 ? this.setFilter("listingType", Array.from(this.selectedTypes)[0]) : this.setFilter("listingType", Array.from(this.selectedTypes));
  }
  updateDisplay() {
    const e = Array.isArray(this.selected) ? this.selected[0] : this.selected;
    this.select && (this.select.value = e || ""), this.element.querySelectorAll(".rs-listing-type__checkbox").forEach((t) => {
      t.checked = this.selectedTypes.has(t.value);
    }), this.element.querySelectorAll(".rs-listing-type__radio").forEach((t) => {
      t.checked = t.value === (e || "");
    });
  }
}
RealtySoft.registerComponent("rs_listing_type", et);
function be(_) {
  return !("property_count" in _) || _.property_count === void 0 || _.property_count === null ? !0 : _.property_count > 0;
}
function tt(_, n) {
  return be(_) ? !0 : n.filter((t) => {
    const s = t.parent_id;
    return !s && s !== 0 ? !1 : String(s) === String(_.id);
  }).some((t) => be(t));
}
class st extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "lockedMode", !1);
    o(this, "propertyTypes", []);
    o(this, "selectedIds", /* @__PURE__ */ new Set());
    o(this, "selectedName", "");
    o(this, "isOpen", !1);
    o(this, "searchTerm", "");
    o(this, "filteredTypes", []);
    o(this, "highlightIndex", -1);
    o(this, "expandedParents", /* @__PURE__ */ new Set());
    // DOM elements
    o(this, "input", null);
    o(this, "dropdown", null);
    o(this, "list", null);
    o(this, "clearBtn", null);
    o(this, "button", null);
    o(this, "buttonText", null);
    o(this, "filterInput", null);
    o(this, "tagsContainer", null);
    o(this, "select", null);
    this.init();
  }
  init() {
    this.lockedMode = this.isLocked("propertyType"), this.propertyTypes = RealtySoftState.get("data.propertyTypes") || [], this.selectedIds = /* @__PURE__ */ new Set(), this.selectedName = this.getFilter("propertyTypeName") || "", this.isOpen = !1, this.searchTerm = "", this.filteredTypes = [], this.highlightIndex = -1, this.expandedParents = /* @__PURE__ */ new Set();
    const e = this.getFilter("propertyType");
    if (e && (Array.isArray(e) ? e.forEach((t) => this.selectedIds.add(String(t))) : this.selectedIds.add(String(e))), this.lockedMode && this.selectedIds.size > 0) {
      const t = Array.from(this.selectedIds)[0], s = this.propertyTypes.find((i) => String(i.id) === t);
      s && (this.selectedName = s.name);
    }
    this.render(), this.lockedMode ? this.applyLockedStyle() : this.bindEvents(), this.subscribe("data.propertyTypes", (t) => {
      this.propertyTypes = t, this.updateList();
    }), this.subscribe("filters.propertyType", (t) => {
      t === null && this.selectedIds.clear(), this.updateDisplay();
    });
  }
  // Get parent property types (no parent_id or parent_id = 0), excluding items with 0 properties
  // For parents, show if they or their children have properties
  getParentTypes() {
    const e = this.propertyTypes.filter(
      (s) => !s.parent_id || s.parent_id === "0" || s.parent_id === 0
    ), t = e.filter((s) => tt(s, this.propertyTypes));
    return console.log(`[RealtySoft] Property type parents: ${e.length} total, ${t.length} after filtering`), console.log(`[RealtySoft] Filtered out types: ${e.filter((s) => !t.includes(s)).map((s) => `${s.name}(${s.property_count})`).join(", ")}`), t.sort((s, i) => (s.name || "").localeCompare(i.name || ""));
  }
  // Get child property types for a parent, excluding items with 0 properties
  getChildTypes(e) {
    return this.propertyTypes.filter((t) => t.parent_id == e && be(t)).sort((t, s) => (t.name || "").localeCompare(s.name || ""));
  }
  // Get all child IDs for a parent
  getAllChildIds(e) {
    return this.getChildTypes(e).map((t) => String(t.id));
  }
  // Check if all children of a parent are selected
  areAllChildrenSelected(e) {
    const t = this.getAllChildIds(e);
    return t.length > 0 && t.every((s) => this.selectedIds.has(s));
  }
  render() {
    switch (this.element.classList.add("rs-property-type", `rs-property-type--v${this.variation}`), this.variation) {
      case "2":
        this.renderFlatMultiSelect();
        break;
      case "3":
        this.renderAccordionMultiSelect();
        break;
      case "4":
        this.renderTraditionalDropdown();
        break;
      default:
        this.renderTypeahead();
    }
  }
  // VARIATION 1: Search/Autocomplete (Single Select)
  renderTypeahead() {
    this.element.innerHTML = `
      <div class="rs-property-type__wrapper">
        <label class="rs-property-type__label">${this.label("search_property_type")}</label>
        <div class="rs-property-type__search-wrapper">
          <input type="text"
                 class="rs-property-type__input"
                 placeholder="Enter property type"
                 value="${this.selectedName}"
                 autocomplete="off">
          <button class="rs-property-type__clear" type="button" style="display: ${this.selectedName ? "block" : "none"}">×</button>
        </div>
        <div class="rs-property-type__dropdown" style="display: none;">
          <div class="rs-property-type__list"></div>
        </div>
      </div>
    `, this.input = this.element.querySelector(".rs-property-type__input"), this.dropdown = this.element.querySelector(".rs-property-type__dropdown"), this.list = this.element.querySelector(".rs-property-type__list"), this.clearBtn = this.element.querySelector(".rs-property-type__clear"), this.filteredTypes = this.propertyTypes.filter((e) => be(e));
  }
  // VARIATION 2: Flat Multi-Select with Filter (styled like Location V3)
  renderFlatMultiSelect() {
    const e = this.selectedIds.size, t = e > 0 ? e + " selected" : this.label("search_property_type"), s = e > 0 ? "has-selection" : "";
    this.element.innerHTML = `
      <div class="rs-property-type__wrapper">
        <label class="rs-property-type__label">${this.label("search_property_type")}</label>
        <button type="button" class="rs-property-type__button ${s}">
          <span class="rs-property-type__button-text">${t}</span>
          <span class="rs-property-type__button-arrow">▼</span>
        </button>
        <div class="rs-property-type__tags"></div>
        <div class="rs-property-type__dropdown rs-property-type__dropdown--multiselect" style="display: none;">
          <input type="text" class="rs-property-type__filter" placeholder="${this.label("search_location_placeholder") || "Search..."}">
          <div class="rs-property-type__list"></div>
        </div>
      </div>
    `, this.button = this.element.querySelector(".rs-property-type__button"), this.buttonText = this.element.querySelector(".rs-property-type__button-text"), this.tagsContainer = this.element.querySelector(".rs-property-type__tags"), this.dropdown = this.element.querySelector(".rs-property-type__dropdown"), this.filterInput = this.element.querySelector(".rs-property-type__filter"), this.list = this.element.querySelector(".rs-property-type__list"), this.renderFlatList(), this.updateTags();
  }
  // VARIATION 3: Accordion Multi-Select with Filter
  renderAccordionMultiSelect() {
    const e = this.selectedIds.size, t = e > 0 ? `${e} type${e > 1 ? "s" : ""} selected` : this.label("search_property_type_placeholder");
    this.element.innerHTML = `
      <div class="rs-property-type__wrapper">
        <label class="rs-property-type__label">${this.label("search_property_type")}</label>
        <button type="button" class="rs-property-type__button">
          <span class="rs-property-type__button-text">${t}</span>
          <span class="rs-property-type__button-arrow">▼</span>
        </button>
        <div class="rs-property-type__dropdown rs-property-type__dropdown--accordion" style="display: none;">
          <input type="text" class="rs-property-type__filter" placeholder="Search property types...">
          <div class="rs-property-type__list"></div>
        </div>
      </div>
    `, this.button = this.element.querySelector(".rs-property-type__button"), this.buttonText = this.element.querySelector(".rs-property-type__button-text"), this.dropdown = this.element.querySelector(".rs-property-type__dropdown"), this.filterInput = this.element.querySelector(".rs-property-type__filter"), this.list = this.element.querySelector(".rs-property-type__list"), this.renderAccordionList();
  }
  // VARIATION 4: Traditional Hierarchical Dropdown (Single Select)
  renderTraditionalDropdown() {
    this.element.innerHTML = `
      <div class="rs-property-type__wrapper">
        <label class="rs-property-type__label">${this.label("search_property_type")}</label>
        <div class="rs-property-type__select-wrapper">
          <select class="rs-property-type__select">
            <option value="">${this.label("search_property_type_placeholder")}</option>
          </select>
        </div>
      </div>
    `, this.select = this.element.querySelector(".rs-property-type__select"), this.populateHierarchicalSelect();
  }
  // Update typeahead list (V1)
  updateTypeaheadList() {
    if (!this.list) return;
    const e = this.filteredTypes.slice(0, 10);
    if (e.length === 0) {
      this.list.innerHTML = '<div class="rs-property-type__no-results">No results found</div>';
      return;
    }
    this.list.innerHTML = e.map((t, s) => {
      const i = !t.parent_id || t.parent_id === "0" || t.parent_id === 0;
      return `
        <div class="rs-property-type__item ${s === this.highlightIndex ? "rs-property-type__item--highlight" : ""}"
             data-id="${t.id}"
             data-name="${this.escapeHtml(t.name)}">
          <span class="rs-property-type__item-text">${this.escapeHtml(t.name)}</span>
          ${i ? "" : '<span class="rs-property-type__item-badge">Sub-type</span>'}
        </div>
      `;
    }).join("");
  }
  // Render flat list with parent/child hierarchy (V2)
  renderFlatList(e = "") {
    if (!this.list) return;
    const t = this.getParentTypes(), s = e.toLowerCase();
    let i = "";
    t.forEach((r) => {
      const a = (r.name || "").toLowerCase().includes(s), l = this.getChildTypes(r.id), d = l.filter(
        (y) => (y.name || "").toLowerCase().includes(s)
      );
      if (!e || a || d.length > 0) {
        const y = this.areAllChildrenSelected(r.id);
        i += `
          <div class="rs-property-type__item rs-property-type__item--parent" style="background: #f5f5f5; padding: 8px 12px; border-bottom: 1px solid #eee;">
            <label class="rs-property-type__checkbox-label" style="display: flex; align-items: center; cursor: pointer;">
              <input type="checkbox"
                     class="rs-property-type__checkbox"
                     value="${r.id}"
                     data-is-parent="true"
                     data-name="${this.escapeHtml(r.name)}"
                     ${y ? "checked" : ""}
                     style="margin-right: 10px;">
              <span class="rs-property-type__checkbox-text" style="font-weight: 600;">${this.escapeHtml(r.name)}</span>
            </label>
          </div>
        `, (e ? d : l).forEach((S) => {
          i += `
            <div class="rs-property-type__item rs-property-type__item--child" style="padding: 8px 12px 8px 32px; border-bottom: 1px solid #eee;">
              <label class="rs-property-type__checkbox-label" style="display: flex; align-items: center; cursor: pointer;">
                <input type="checkbox"
                       class="rs-property-type__checkbox"
                       value="${S.id}"
                       data-parent-id="${r.id}"
                       data-name="${this.escapeHtml(S.name)}"
                       ${this.selectedIds.has(String(S.id)) ? "checked" : ""}
                       style="margin-right: 10px;">
                <span class="rs-property-type__checkbox-text">${this.escapeHtml(S.name)}</span>
              </label>
            </div>
          `;
        });
      }
    }), this.list.innerHTML = i || '<div class="rs-property-type__no-results">No results found</div>';
  }
  // Render accordion list (V3)
  renderAccordionList(e = "") {
    if (!this.list) return;
    const t = this.getParentTypes(), s = e.toLowerCase();
    let i = "";
    t.forEach((r) => {
      const a = (r.name || "").toLowerCase().includes(s), l = this.getChildTypes(r.id), d = l.filter(
        (y) => (y.name || "").toLowerCase().includes(s)
      );
      if (!e || a || d.length > 0) {
        const y = this.expandedParents.has(String(r.id)) || !!e, p = this.areAllChildrenSelected(r.id), S = e ? d : l;
        i += `
          <div class="rs-property-type__accordion ${y ? "rs-property-type__accordion--expanded" : ""}">
            <div class="rs-property-type__accordion-header">
              <label class="rs-property-type__checkbox-label" onclick="event.stopPropagation()">
                <input type="checkbox"
                       class="rs-property-type__checkbox"
                       value="${r.id}"
                       data-is-parent="true"
                       ${p ? "checked" : ""}>
                <span class="rs-property-type__checkbox-text"><strong>${this.escapeHtml(r.name)}</strong></span>
              </label>
              <button type="button" class="rs-property-type__accordion-toggle" data-parent-id="${r.id}">
                ${y ? "−" : "+"}
              </button>
            </div>
            <div class="rs-property-type__accordion-content" style="display: ${y ? "block" : "none"}">
        `, S.forEach((C) => {
          i += `
            <div class="rs-property-type__item rs-property-type__item--child">
              <label class="rs-property-type__checkbox-label">
                <input type="checkbox"
                       class="rs-property-type__checkbox"
                       value="${C.id}"
                       data-parent-id="${r.id}"
                       ${this.selectedIds.has(String(C.id)) ? "checked" : ""}>
                <span class="rs-property-type__checkbox-text">${this.escapeHtml(C.name)}</span>
              </label>
            </div>
          `;
        }), i += "</div></div>";
      }
    }), this.list.innerHTML = i || '<div class="rs-property-type__no-results">No results found</div>';
  }
  // Populate hierarchical select (V4)
  populateHierarchicalSelect() {
    if (!this.select) return;
    const e = this.getParentTypes();
    let t = `<option value="">${this.label("search_property_type")}</option>`;
    e.forEach((s) => {
      t += `<option value="${s.id}">${this.escapeHtml(s.name)}</option>`, this.getChildTypes(s.id).forEach((r) => {
        t += `<option value="${r.id}">&nbsp;&nbsp;├─ ${this.escapeHtml(r.name)}</option>`;
      });
    }), this.select.innerHTML = t, this.selectedIds.size > 0 && (this.select.value = Array.from(this.selectedIds)[0]);
  }
  bindEvents() {
    switch (this.variation) {
      case "2":
        this.bindFlatMultiSelectEvents();
        break;
      case "3":
        this.bindAccordionMultiSelectEvents();
        break;
      case "4":
        this.bindTraditionalDropdownEvents();
        break;
      default:
        this.bindTypeaheadEvents();
    }
    document.addEventListener("click", (e) => {
      this.element.contains(e.target) || this.hideDropdown();
    });
  }
  // Bind events for V1 (Typeahead)
  bindTypeaheadEvents() {
    !this.input || !this.list || !this.clearBtn || (this.input.addEventListener("blur", () => {
      setTimeout(() => this.hideDropdown(), 200);
    }), this.input.addEventListener("input", (e) => {
      const t = e.target;
      this.searchTerm = t.value.toLowerCase(), this.clearBtn && (this.clearBtn.style.display = t.value ? "block" : "none"), t.value.length >= 1 ? (this.filterTypes(), this.showDropdown()) : this.hideDropdown();
    }), this.input.addEventListener("keydown", (e) => this.handleKeyboard(e)), this.list.addEventListener("click", (e) => {
      const s = e.target.closest(".rs-property-type__item");
      s && s.dataset.id && s.dataset.name && this.selectSingleType(s.dataset.id, s.dataset.name);
    }), this.clearBtn.addEventListener("click", () => this.clearSelection()));
  }
  // Bind events for V2 (Flat Multi-Select)
  bindFlatMultiSelectEvents() {
    if (!this.button || !this.filterInput || !this.list) return;
    let e;
    this.button.addEventListener("click", (t) => {
      t.preventDefault(), this.toggleDropdown();
    }), this.filterInput.addEventListener("input", (t) => {
      clearTimeout(e), e = setTimeout(() => {
        const s = t.target;
        this.renderFlatList(s.value.trim());
      }, 200);
    }), this.list.addEventListener("change", (t) => {
      const s = t.target;
      s.classList.contains("rs-property-type__checkbox") && this.handleCheckboxChange(s);
    });
  }
  // Bind events for V3 (Accordion Multi-Select)
  bindAccordionMultiSelectEvents() {
    if (!this.button || !this.filterInput || !this.list) return;
    let e;
    this.button.addEventListener("click", (t) => {
      t.preventDefault(), this.toggleDropdown();
    }), this.filterInput.addEventListener("input", (t) => {
      clearTimeout(e), e = setTimeout(() => {
        const s = t.target;
        this.renderAccordionList(s.value.trim());
      }, 200);
    }), this.list.addEventListener("click", (t) => {
      const i = t.target.closest(".rs-property-type__accordion-toggle");
      if (i) {
        const r = i.dataset.parentId, a = i.closest(".rs-property-type__accordion");
        if (!a || !r) return;
        const l = a.querySelector(".rs-property-type__accordion-content");
        a.classList.contains("rs-property-type__accordion--expanded") ? (a.classList.remove("rs-property-type__accordion--expanded"), l && (l.style.display = "none"), i.textContent = "+", this.expandedParents.delete(r)) : (a.classList.add("rs-property-type__accordion--expanded"), l && (l.style.display = "block"), i.textContent = "−", this.expandedParents.add(r));
      }
    }), this.list.addEventListener("change", (t) => {
      const s = t.target;
      s.classList.contains("rs-property-type__checkbox") && this.handleCheckboxChange(s);
    });
  }
  // Bind events for V4 (Traditional Dropdown)
  bindTraditionalDropdownEvents() {
    this.select && this.select.addEventListener("change", (e) => {
      const t = e.target, s = t.value;
      if (s) {
        this.selectedIds.clear(), this.selectedIds.add(s);
        const i = t.options[t.selectedIndex];
        this.setFilter("propertyType", parseInt(s)), this.setFilter("propertyTypeName", i.text.replace(/^\s*├─\s*/, ""));
      } else
        this.selectedIds.clear(), this.setFilter("propertyType", null), this.setFilter("propertyTypeName", "");
    });
  }
  // Handle checkbox change for multi-select variations
  handleCheckboxChange(e) {
    const t = e.value;
    if (e.dataset.isParent === "true") {
      const i = this.getAllChildIds(t);
      e.checked ? (this.selectedIds.add(t), i.forEach((r) => this.selectedIds.add(r))) : (this.selectedIds.delete(t), i.forEach((r) => this.selectedIds.delete(r))), this.list && this.list.querySelectorAll(`input[data-parent-id="${t}"]`).forEach((r) => {
        r.checked = e.checked;
      });
    } else {
      e.checked ? this.selectedIds.add(t) : this.selectedIds.delete(t);
      const i = e.dataset.parentId;
      if (i && this.list) {
        const r = this.list.querySelector(`input[value="${i}"][data-is-parent="true"]`);
        r && (r.checked = this.areAllChildrenSelected(i));
      }
    }
    this.updateButtonText(), this.updateTags(), this.updateFilters();
  }
  filterTypes() {
    const e = this.propertyTypes.filter((t) => be(t));
    this.searchTerm ? this.filteredTypes = e.filter(
      (t) => (t.name || "").toLowerCase().includes(this.searchTerm)
    ) : this.filteredTypes = e, this.highlightIndex = -1, this.updateTypeaheadList();
  }
  showDropdown() {
    this.dropdown && (this.isOpen = !0, this.dropdown.style.display = "block");
  }
  hideDropdown() {
    this.dropdown && (this.isOpen = !1, this.dropdown.style.display = "none", this.highlightIndex = -1);
  }
  toggleDropdown() {
    this.isOpen ? this.hideDropdown() : this.showDropdown();
  }
  handleKeyboard(e) {
    if (!this.isOpen) {
      (e.key === "ArrowDown" || e.key === "Enter") && this.showDropdown();
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault(), this.highlightIndex = Math.min(this.highlightIndex + 1, this.filteredTypes.slice(0, 10).length - 1), this.updateTypeaheadList();
        break;
      case "ArrowUp":
        e.preventDefault(), this.highlightIndex = Math.max(this.highlightIndex - 1, 0), this.updateTypeaheadList();
        break;
      case "Enter":
        if (e.preventDefault(), this.highlightIndex >= 0 && this.filteredTypes[this.highlightIndex]) {
          const t = this.filteredTypes[this.highlightIndex];
          this.selectSingleType(String(t.id), t.name);
        }
        break;
      case "Escape":
        this.hideDropdown();
        break;
    }
  }
  selectSingleType(e, t) {
    this.selectedIds.clear(), this.selectedIds.add(e), this.selectedName = t, this.setFilter("propertyType", parseInt(e)), this.setFilter("propertyTypeName", t), this.input && this.clearBtn && (this.input.value = t, this.clearBtn.style.display = "block"), this.hideDropdown();
  }
  clearSelection() {
    this.selectedIds.clear(), this.selectedName = "", this.setFilter("propertyType", null), this.setFilter("propertyTypeName", ""), this.input && this.clearBtn && (this.input.value = "", this.clearBtn.style.display = "none"), this.select && (this.select.value = ""), this.updateButtonText();
  }
  updateButtonText() {
    if (!this.buttonText || !this.button) return;
    const e = this.selectedIds.size;
    e > 0 ? (this.buttonText.textContent = e + " selected", this.button.classList.add("has-selection")) : (this.buttonText.textContent = this.label("search_property_type"), this.button.classList.remove("has-selection"));
  }
  // Update tags for V2
  updateTags() {
    if (!this.tagsContainer) return;
    if (this.selectedIds.size === 0) {
      this.tagsContainer.innerHTML = "";
      return;
    }
    const e = [];
    this.selectedIds.forEach((s) => {
      const i = this.propertyTypes.find((r) => String(r.id) === String(s));
      i && e.push({ id: i.id, name: i.name });
    });
    const t = e.map((s) => `
      <span class="rs-property-type__tag" style="display: inline-flex; align-items: center; background: #2e7d32; color: white; padding: 4px 10px; border-radius: 4px; margin: 4px 4px 4px 0; font-size: 13px;">
        ${this.escapeHtml(s.name)}
        <button type="button" class="rs-property-type__tag-remove" data-id="${s.id}" style="background: none; border: none; color: white; margin-left: 6px; cursor: pointer; font-size: 14px; padding: 0; line-height: 1;">&times;</button>
      </span>
    `).join("");
    this.tagsContainer.innerHTML = t, this.tagsContainer.querySelectorAll(".rs-property-type__tag-remove").forEach((s) => {
      s.addEventListener("click", (i) => {
        var a;
        i.stopPropagation();
        const r = s.dataset.id;
        r && (this.selectedIds.delete(String(r)), this.updateButtonText(), this.updateTags(), this.updateFilters(), this.renderFlatList(((a = this.filterInput) == null ? void 0 : a.value) || ""));
      });
    });
  }
  updateFilters() {
    if (this.selectedIds.size > 0) {
      const e = Array.from(this.selectedIds).map((t) => parseInt(t));
      this.setFilter("propertyType", e.length === 1 ? e[0] : e);
    } else
      this.setFilter("propertyType", null);
  }
  updateList() {
    switch (this.variation) {
      case "2":
        this.renderFlatList();
        break;
      case "3":
        this.renderAccordionList();
        break;
      case "4":
        this.populateHierarchicalSelect();
        break;
      default:
        this.filterTypes();
    }
  }
  updateDisplay() {
    const e = this.getFilter("propertyType");
    this.input && (this.input.value = this.selectedName || ""), this.select && (this.select.value = this.selectedIds.size > 0 ? Array.from(this.selectedIds)[0] : ""), (this.variation === "2" || this.variation === "3") && !e && (this.selectedIds.clear(), this.selectedName = "", this.element.querySelectorAll(".rs-property-type__checkbox").forEach((t) => {
      t.checked = !1;
    }), this.updateTags()), this.updateButtonText();
  }
  escapeHtml(e) {
    if (!e) return "";
    const t = document.createElement("div");
    return t.textContent = e, t.innerHTML;
  }
}
RealtySoft.registerComponent("rs_property_type", st);
class it extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "lockedMode", !1);
    o(this, "minValue", null);
    o(this, "maxValue", null);
    o(this, "maxOptions", 10);
    o(this, "style", "minimum");
    o(this, "selectedValues", /* @__PURE__ */ new Set());
    o(this, "isOpen", !1);
    o(this, "select", null);
    o(this, "input", null);
    o(this, "button", null);
    o(this, "buttonText", null);
    o(this, "dropdown", null);
    this.init();
  }
  init() {
    if (this.lockedMode = this.isLocked("bedsMin") || this.isLocked("bedsMax"), this.minValue = this.getFilter("bedsMin"), this.maxValue = this.getFilter("bedsMax"), this.maxOptions = 10, this.style = this.element.dataset.rsStyle || "minimum", this.selectedValues = /* @__PURE__ */ new Set(), this.isOpen = !1, this.minValue && this.style === "exact" && this.maxValue)
      for (let e = this.minValue; e <= this.maxValue; e++)
        this.selectedValues.add(e);
    this.render(), this.lockedMode ? this.applyLockedStyle() : this.bindEvents(), this.subscribe("filters.bedsMin", (e) => {
      this.minValue = e, this.updateDisplay();
    });
  }
  render() {
    switch (this.element.classList.add("rs-bedrooms", `rs-bedrooms--v${this.variation}`), this.variation) {
      case "2":
        this.renderBoxStyle();
        break;
      case "3":
        this.renderMultiSelect();
        break;
      case "4":
        this.renderFreeInput();
        break;
      default:
        this.renderDropdown();
    }
  }
  // VARIATION 1: Dropdown
  renderDropdown() {
    let t = `<option value="">${this.label("search_bedrooms_any") || "Any Bedrooms"}</option>`;
    for (let s = 1; s <= this.maxOptions; s++) {
      const i = this.style === "minimum" ? `${s}+` : `${s}`, r = this.minValue === s ? "selected" : "";
      t += `<option value="${s}" ${r}>${i}</option>`;
    }
    this.element.innerHTML = `
      <div class="rs-bedrooms__wrapper">
        <label class="rs-bedrooms__label">${this.label("search_bedrooms")}</label>
        <div class="rs-bedrooms__select-wrapper">
          <select class="rs-bedrooms__select">${t}</select>
        </div>
      </div>
    `, this.select = this.element.querySelector(".rs-bedrooms__select");
  }
  // VARIATION 2: Box Style (Horizontal Buttons)
  renderBoxStyle() {
    let e = "";
    for (let t = 1; t <= this.maxOptions; t++) {
      const s = this.style === "minimum" ? `${t}+` : `${t}`, i = this.minValue === t ? "rs-bedrooms__box--active" : "";
      e += `<button type="button" class="rs-bedrooms__box ${i}" data-value="${t}">${s}</button>`;
    }
    this.element.innerHTML = `
      <div class="rs-bedrooms__wrapper">
        <label class="rs-bedrooms__label">${this.label("search_bedrooms")}</label>
        <div class="rs-bedrooms__boxes">${e}</div>
      </div>
    `;
  }
  // VARIATION 3: Multi-Select Dropdown
  renderMultiSelect() {
    const e = this.label("search_bedrooms_select") || "Select Bedrooms", t = this.selectedValues.size, s = t > 0 ? `${t} selected` : e;
    let i = "";
    for (let r = 1; r <= this.maxOptions; r++) {
      const a = this.style === "minimum" ? `${r}+` : `${r}`, l = this.selectedValues.has(r) ? "checked" : "";
      i += `
        <label class="rs-bedrooms__multiselect-option">
          <input type="checkbox" class="rs-bedrooms__multiselect-checkbox" value="${r}" ${l}>
          <span>${a}</span>
        </label>
      `;
    }
    this.element.innerHTML = `
      <div class="rs-bedrooms__wrapper">
        <label class="rs-bedrooms__label">${this.label("search_bedrooms")}</label>
        <div class="rs-bedrooms__multiselect">
          <button type="button" class="rs-bedrooms__multiselect-button">
            <span class="rs-bedrooms__multiselect-text">${s}</span>
            <span class="rs-bedrooms__multiselect-arrow">▼</span>
          </button>
          <div class="rs-bedrooms__multiselect-dropdown" style="display: none;">
            ${i}
          </div>
        </div>
      </div>
    `, this.button = this.element.querySelector(".rs-bedrooms__multiselect-button"), this.buttonText = this.element.querySelector(".rs-bedrooms__multiselect-text"), this.dropdown = this.element.querySelector(".rs-bedrooms__multiselect-dropdown");
  }
  // VARIATION 4: Free Input
  renderFreeInput() {
    const e = this.label("search_bedrooms_input") || "e.g., 3";
    this.element.innerHTML = `
      <div class="rs-bedrooms__wrapper">
        <label class="rs-bedrooms__label">${this.label("search_bedrooms")}</label>
        <div class="rs-bedrooms__input-wrapper">
          <input type="number"
                 class="rs-bedrooms__input"
                 min="0"
                 max="20"
                 placeholder="${e}"
                 value="${this.minValue || ""}">
        </div>
      </div>
    `, this.input = this.element.querySelector(".rs-bedrooms__input");
  }
  bindEvents() {
    switch (this.variation) {
      case "2":
        this.bindBoxStyleEvents();
        break;
      case "3":
        this.bindMultiSelectEvents();
        break;
      case "4":
        this.bindFreeInputEvents();
        break;
      default:
        this.bindDropdownEvents();
    }
  }
  bindDropdownEvents() {
    this.select && this.select.addEventListener("change", (e) => {
      const t = e.target, s = t.value ? parseInt(t.value) : null;
      this.handleSelection(s);
    });
  }
  bindBoxStyleEvents() {
    this.element.querySelectorAll(".rs-bedrooms__box").forEach((e) => {
      e.addEventListener("click", (t) => {
        t.preventDefault();
        const s = t.target, i = parseInt(s.dataset.value || "0"), r = s.classList.contains("rs-bedrooms__box--active");
        this.element.querySelectorAll(".rs-bedrooms__box").forEach(
          (a) => a.classList.remove("rs-bedrooms__box--active")
        ), r ? this.handleSelection(null) : (s.classList.add("rs-bedrooms__box--active"), this.handleSelection(i));
      });
    });
  }
  bindMultiSelectEvents() {
    this.button && this.button.addEventListener("click", (e) => {
      e.preventDefault(), this.toggleDropdown();
    }), document.addEventListener("click", (e) => {
      this.element.contains(e.target) || this.hideDropdown();
    }), this.element.querySelectorAll(".rs-bedrooms__multiselect-checkbox").forEach((e) => {
      e.addEventListener("change", (t) => {
        const s = t.target, i = parseInt(s.value);
        s.checked ? this.selectedValues.add(i) : this.selectedValues.delete(i), this.updateMultiSelectButton(), this.updateMultiSelectFilters();
      });
    });
  }
  bindFreeInputEvents() {
    let e;
    this.input && this.input.addEventListener("input", (t) => {
      clearTimeout(e), e = setTimeout(() => {
        const s = t.target, i = parseInt(s.value);
        this.handleSelection(i && i > 0 ? i : null);
      }, 300);
    });
  }
  handleSelection(e) {
    e ? this.style === "minimum" ? (this.setFilter("bedsMin", e), this.setFilter("bedsMax", null)) : (this.setFilter("bedsMin", e), this.setFilter("bedsMax", e)) : (this.setFilter("bedsMin", null), this.setFilter("bedsMax", null));
  }
  updateMultiSelectButton() {
    if (!this.buttonText) return;
    const e = this.label("search_bedrooms_select") || "Select Bedrooms", t = this.selectedValues.size;
    this.buttonText.textContent = t > 0 ? `${t} selected` : e;
  }
  updateMultiSelectFilters() {
    if (this.selectedValues.size > 0) {
      const e = Array.from(this.selectedValues).sort((t, s) => t - s);
      this.setFilter("bedsMin", Math.min(...e)), this.setFilter("bedsMax", Math.max(...e));
    } else
      this.setFilter("bedsMin", null), this.setFilter("bedsMax", null);
  }
  showDropdown() {
    this.dropdown && (this.isOpen = !0, this.dropdown.style.display = "block");
  }
  hideDropdown() {
    this.dropdown && (this.isOpen = !1, this.dropdown.style.display = "none");
  }
  toggleDropdown() {
    this.isOpen ? this.hideDropdown() : this.showDropdown();
  }
  updateDisplay() {
    var e, t;
    this.select && (this.select.value = ((e = this.minValue) == null ? void 0 : e.toString()) || ""), this.element.querySelectorAll(".rs-bedrooms__box").forEach((s) => {
      const i = parseInt(s.dataset.value || "0");
      s.classList.toggle("rs-bedrooms__box--active", this.minValue === i);
    }), this.input && (this.input.value = ((t = this.minValue) == null ? void 0 : t.toString()) || ""), this.variation === "3" && (this.minValue || this.selectedValues.clear(), this.element.querySelectorAll(".rs-bedrooms__multiselect-checkbox").forEach((s) => {
      const i = parseInt(s.value);
      s.checked = this.selectedValues.has(i);
    })), this.updateMultiSelectButton();
  }
}
RealtySoft.registerComponent("rs_bedrooms", it);
class rt extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "lockedMode", !1);
    o(this, "minValue", null);
    o(this, "maxValue", null);
    o(this, "maxOptions", 10);
    o(this, "style", "minimum");
    o(this, "selectedValues", /* @__PURE__ */ new Set());
    o(this, "isOpen", !1);
    o(this, "select", null);
    o(this, "input", null);
    o(this, "button", null);
    o(this, "buttonText", null);
    o(this, "dropdown", null);
    this.init();
  }
  init() {
    if (this.lockedMode = this.isLocked("bathsMin") || this.isLocked("bathsMax"), this.minValue = this.getFilter("bathsMin"), this.maxValue = this.getFilter("bathsMax"), this.maxOptions = 10, this.style = this.element.dataset.rsStyle || "minimum", this.selectedValues = /* @__PURE__ */ new Set(), this.isOpen = !1, this.minValue && this.style === "exact" && this.maxValue)
      for (let e = this.minValue; e <= this.maxValue; e++)
        this.selectedValues.add(e);
    this.render(), this.lockedMode ? this.applyLockedStyle() : this.bindEvents(), this.subscribe("filters.bathsMin", (e) => {
      this.minValue = e, this.updateDisplay();
    });
  }
  render() {
    switch (this.element.classList.add("rs-bathrooms", `rs-bathrooms--v${this.variation}`), this.variation) {
      case "2":
        this.renderBoxStyle();
        break;
      case "3":
        this.renderMultiSelect();
        break;
      case "4":
        this.renderFreeInput();
        break;
      default:
        this.renderDropdown();
    }
  }
  // VARIATION 1: Dropdown
  renderDropdown() {
    let t = `<option value="">${this.label("search_bathrooms_any") || "Any Bathrooms"}</option>`;
    for (let s = 1; s <= this.maxOptions; s++) {
      const i = this.style === "minimum" ? `${s}+` : `${s}`, r = this.minValue === s ? "selected" : "";
      t += `<option value="${s}" ${r}>${i}</option>`;
    }
    this.element.innerHTML = `
      <div class="rs-bathrooms__wrapper">
        <label class="rs-bathrooms__label">${this.label("search_bathrooms")}</label>
        <div class="rs-bathrooms__select-wrapper">
          <select class="rs-bathrooms__select">${t}</select>
        </div>
      </div>
    `, this.select = this.element.querySelector(".rs-bathrooms__select");
  }
  // VARIATION 2: Box Style (Horizontal Buttons)
  renderBoxStyle() {
    let e = "";
    for (let t = 1; t <= this.maxOptions; t++) {
      const s = this.style === "minimum" ? `${t}+` : `${t}`, i = this.minValue === t ? "rs-bathrooms__box--active" : "";
      e += `<button type="button" class="rs-bathrooms__box ${i}" data-value="${t}">${s}</button>`;
    }
    this.element.innerHTML = `
      <div class="rs-bathrooms__wrapper">
        <label class="rs-bathrooms__label">${this.label("search_bathrooms")}</label>
        <div class="rs-bathrooms__boxes">${e}</div>
      </div>
    `;
  }
  // VARIATION 3: Multi-Select Dropdown
  renderMultiSelect() {
    const e = this.label("search_bathrooms_select") || "Select Bathrooms", t = this.selectedValues.size, s = t > 0 ? t + " selected" : e;
    let i = "";
    for (let r = 1; r <= this.maxOptions; r++) {
      const a = this.style === "minimum" ? `${r}+` : `${r}`, l = this.selectedValues.has(r) ? "checked" : "";
      i += `
        <label class="rs-bathrooms__multiselect-option">
          <input type="checkbox" class="rs-bathrooms__multiselect-checkbox" value="${r}" ${l}>
          <span>${a}</span>
        </label>
      `;
    }
    this.element.innerHTML = `
      <div class="rs-bathrooms__wrapper">
        <label class="rs-bathrooms__label">${this.label("search_bathrooms")}</label>
        <div class="rs-bathrooms__multiselect">
          <button type="button" class="rs-bathrooms__multiselect-button">
            <span class="rs-bathrooms__multiselect-text">${s}</span>
            <span class="rs-bathrooms__multiselect-arrow">▼</span>
          </button>
          <div class="rs-bathrooms__multiselect-dropdown" style="display: none;">
            ${i}
          </div>
        </div>
      </div>
    `, this.button = this.element.querySelector(".rs-bathrooms__multiselect-button"), this.buttonText = this.element.querySelector(".rs-bathrooms__multiselect-text"), this.dropdown = this.element.querySelector(".rs-bathrooms__multiselect-dropdown");
  }
  // VARIATION 4: Free Input
  renderFreeInput() {
    const e = this.label("search_bathrooms_input") || "e.g., 2";
    this.element.innerHTML = `
      <div class="rs-bathrooms__wrapper">
        <label class="rs-bathrooms__label">${this.label("search_bathrooms")}</label>
        <div class="rs-bathrooms__input-wrapper">
          <input type="number"
                 class="rs-bathrooms__input"
                 min="0"
                 max="10"
                 placeholder="${e}"
                 value="${this.minValue || ""}">
        </div>
      </div>
    `, this.input = this.element.querySelector(".rs-bathrooms__input");
  }
  bindEvents() {
    switch (this.variation) {
      case "2":
        this.bindBoxStyleEvents();
        break;
      case "3":
        this.bindMultiSelectEvents();
        break;
      case "4":
        this.bindFreeInputEvents();
        break;
      default:
        this.bindDropdownEvents();
    }
  }
  bindDropdownEvents() {
    this.select && this.select.addEventListener("change", (e) => {
      const t = e.target, s = t.value ? parseInt(t.value) : null;
      this.handleSelection(s);
    });
  }
  bindBoxStyleEvents() {
    this.element.querySelectorAll(".rs-bathrooms__box").forEach((e) => {
      e.addEventListener("click", (t) => {
        t.preventDefault();
        const s = t.target, i = parseInt(s.dataset.value || "0"), r = s.classList.contains("rs-bathrooms__box--active");
        this.element.querySelectorAll(".rs-bathrooms__box").forEach(
          (a) => a.classList.remove("rs-bathrooms__box--active")
        ), r ? this.handleSelection(null) : (s.classList.add("rs-bathrooms__box--active"), this.handleSelection(i));
      });
    });
  }
  bindMultiSelectEvents() {
    this.button && this.button.addEventListener("click", (e) => {
      e.preventDefault(), this.toggleDropdown();
    }), document.addEventListener("click", (e) => {
      this.element.contains(e.target) || this.hideDropdown();
    }), this.element.querySelectorAll(".rs-bathrooms__multiselect-checkbox").forEach((e) => {
      e.addEventListener("change", (t) => {
        const s = t.target, i = parseInt(s.value);
        s.checked ? this.selectedValues.add(i) : this.selectedValues.delete(i), this.updateMultiSelectButton(), this.updateMultiSelectFilters();
      });
    });
  }
  bindFreeInputEvents() {
    let e;
    this.input && this.input.addEventListener("input", (t) => {
      clearTimeout(e), e = setTimeout(() => {
        const s = t.target, i = parseInt(s.value);
        this.handleSelection(i && i > 0 ? i : null);
      }, 300);
    });
  }
  handleSelection(e) {
    e ? this.style === "minimum" ? (this.setFilter("bathsMin", e), this.setFilter("bathsMax", null)) : (this.setFilter("bathsMin", e), this.setFilter("bathsMax", e)) : (this.setFilter("bathsMin", null), this.setFilter("bathsMax", null));
  }
  updateMultiSelectButton() {
    if (!this.buttonText) return;
    const e = this.label("search_bathrooms_select") || "Select Bathrooms", t = this.selectedValues.size;
    this.buttonText.textContent = t > 0 ? t + " selected" : e;
  }
  updateMultiSelectFilters() {
    if (this.selectedValues.size > 0) {
      const e = Array.from(this.selectedValues).sort((t, s) => t - s);
      this.setFilter("bathsMin", Math.min(...e)), this.setFilter("bathsMax", Math.max(...e));
    } else
      this.setFilter("bathsMin", null), this.setFilter("bathsMax", null);
  }
  showDropdown() {
    this.dropdown && (this.isOpen = !0, this.dropdown.style.display = "block");
  }
  hideDropdown() {
    this.dropdown && (this.isOpen = !1, this.dropdown.style.display = "none");
  }
  toggleDropdown() {
    this.isOpen ? this.hideDropdown() : this.showDropdown();
  }
  updateDisplay() {
    var e, t;
    this.select && (this.select.value = ((e = this.minValue) == null ? void 0 : e.toString()) || ""), this.element.querySelectorAll(".rs-bathrooms__box").forEach((s) => {
      const i = parseInt(s.dataset.value || "0");
      s.classList.toggle("rs-bathrooms__box--active", this.minValue === i);
    }), this.input && (this.input.value = ((t = this.minValue) == null ? void 0 : t.toString()) || ""), this.variation === "3" && (this.minValue || this.selectedValues.clear(), this.element.querySelectorAll(".rs-bathrooms__multiselect-checkbox").forEach((s) => {
      const i = parseInt(s.value);
      s.checked = this.selectedValues.has(i);
    })), this.updateMultiSelectButton();
  }
}
RealtySoft.registerComponent("rs_bathrooms", rt);
class at extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "lockedMode", !1);
    o(this, "type", "min");
    o(this, "minValue", null);
    o(this, "maxValue", null);
    o(this, "currentValue", null);
    o(this, "selectedValues", /* @__PURE__ */ new Set());
    o(this, "isOpen", !1);
    o(this, "maxVisible", 10);
    o(this, "select", null);
    o(this, "input", null);
    o(this, "button", null);
    o(this, "buttonText", null);
    o(this, "dropdown", null);
    o(this, "toggleBtn", null);
    o(this, "toggleText", null);
    this.init();
  }
  init() {
    this.lockedMode = this.isLocked("priceMin") || this.isLocked("priceMax"), this.type = this.element.dataset.rsType || "min", this.minValue = this.getFilter("priceMin"), this.maxValue = this.getFilter("priceMax"), this.currentValue = this.type === "min" ? this.minValue : this.maxValue, this.selectedValues = /* @__PURE__ */ new Set(), this.isOpen = !1, this.maxVisible = 10, this.currentValue && this.selectedValues.add(this.currentValue), this.render(), this.lockedMode ? this.applyLockedStyle() : this.bindEvents(), this.subscribe("filters.priceMin", (e) => {
      this.minValue = e, this.type === "min" && (this.currentValue = e, this.updateDisplay());
    }), this.subscribe("filters.priceMax", (e) => {
      this.maxValue = e, this.type === "max" && (this.currentValue = e, this.updateDisplay());
    }), this.subscribe("filters.listingType", () => {
      this.updatePriceOptions();
    });
  }
  // Get price options based on listing type
  getPriceOptions() {
    const e = this.getFilter("listingType") || "resale", t = {
      resale: {
        min: [5e4, 1e5, 15e4, 2e5, 25e4, 3e5, 4e5, 5e5, 75e4, 1e6, 15e5, 2e6, 3e6, 5e6, 1e7, 2e7],
        max: [1e5, 2e5, 3e5, 5e5, 75e4, 1e6, 15e5, 2e6, 3e6, 5e6, 1e7, 2e7, 5e7]
      },
      development: {
        min: [5e4, 1e5, 15e4, 2e5, 25e4, 3e5, 4e5, 5e5, 75e4, 1e6, 15e5, 2e6, 3e6, 5e6, 1e7, 2e7],
        max: [1e5, 2e5, 3e5, 5e5, 75e4, 1e6, 15e5, 2e6, 3e6, 5e6, 1e7, 2e7, 5e7]
      },
      long_rental: {
        min: [500, 750, 1e3, 1250, 1500, 2e3, 2500, 3e3, 5e3, 1e4, 25e3],
        max: [750, 1e3, 1250, 1500, 2e3, 2500, 3e3, 5e3, 1e4, 25e3, 5e4]
      },
      short_rental: {
        min: [250, 350, 500, 750, 1e3, 1250, 1500, 2e3, 2500, 3e3, 5e3, 1e4, 25e3],
        max: [350, 500, 750, 1e3, 1250, 1500, 2e3, 2500, 3e3, 5e3, 1e4, 25e3, 5e4]
      }
    }, s = t[e] || t.resale;
    return s[this.type] || s.min;
  }
  // Format price (short format)
  formatPrice(e) {
    return e >= 1e6 ? `€${e / 1e6}M` : e >= 1e3 ? `€${e / 1e3}K` : `€${e.toLocaleString()}`;
  }
  // Format price (full format)
  formatPriceFull(e) {
    return `€${e.toLocaleString()}`;
  }
  render() {
    switch (this.element.classList.add("rs-price", `rs-price--v${this.variation}`, `rs-price--${this.type}`), this.variation) {
      case "2":
        this.renderStackedButtons();
        break;
      case "3":
        this.renderMultiSelect();
        break;
      case "4":
        this.renderFreeInput();
        break;
      default:
        this.renderStyledDropdown();
    }
  }
  // VARIATION 1: Styled Dropdown
  renderStyledDropdown() {
    const e = this.type === "min" ? this.label("search_price_min") || "Min. Price" : this.label("search_price_max") || "Max. Price", t = this.getPriceOptions();
    this.currentValue && !t.includes(this.currentValue) && (t.push(this.currentValue), t.sort((i, r) => i - r));
    let s = `<option value="">${e}</option>`;
    t.forEach((i) => {
      const r = this.currentValue === i ? "selected" : "";
      s += `<option value="${i}" ${r}>${this.formatPriceFull(i)}</option>`;
    }), this.element.innerHTML = `
      <div class="rs-price__wrapper">
        <label class="rs-price__label">${this.type === "min" ? this.label("search_price_min") : this.label("search_price_max")}</label>
        <div class="rs-price__select-wrapper">
          <select class="rs-price__select">${s}</select>
        </div>
      </div>
    `, this.select = this.element.querySelector(".rs-price__select");
  }
  // VARIATION 2: Stacked Buttons
  renderStackedButtons() {
    const e = this.type === "min" ? this.label("search_price_min") || "Min. Price" : this.label("search_price_max") || "Max. Price", t = this.getPriceOptions(), s = this.currentValue ? this.formatPriceFull(this.currentValue) : e;
    let i = `
      <button type="button" class="rs-price__option" data-value="">
        <span class="rs-price__option-text">${e}</span>
      </button>
    `;
    t.slice(0, this.maxVisible).forEach((r) => {
      const a = this.currentValue === r ? "rs-price__option--active" : "";
      i += `
        <button type="button" class="rs-price__option ${a}" data-value="${r}">
          <span class="rs-price__option-text">${this.formatPriceFull(r)}</span>
        </button>
      `;
    }), this.element.innerHTML = `
      <div class="rs-price__wrapper">
        <label class="rs-price__label">${this.type === "min" ? this.label("search_price_min") : this.label("search_price_max")}</label>
        <div class="rs-price__stacked">
          <button type="button" class="rs-price__toggle ${this.currentValue ? "rs-price__toggle--has-selection" : ""}">
            <span class="rs-price__toggle-text">${s}</span>
            <span class="rs-price__toggle-arrow">▼</span>
          </button>
          <div class="rs-price__dropdown" style="display: none;">
            ${i}
          </div>
        </div>
      </div>
    `, this.toggleBtn = this.element.querySelector(".rs-price__toggle"), this.toggleText = this.element.querySelector(".rs-price__toggle-text"), this.dropdown = this.element.querySelector(".rs-price__dropdown");
  }
  // VARIATION 3: Multi-Select Dropdown
  renderMultiSelect() {
    const e = this.type === "min" ? this.label("search_price_select_min") || "Select Min Prices" : this.label("search_price_select_max") || "Select Max Prices", t = this.getPriceOptions(), s = this.selectedValues.size, i = s > 0 ? s + " selected" : e;
    let r = "";
    t.forEach((a) => {
      const l = this.selectedValues.has(a) ? "checked" : "";
      r += `
        <label class="rs-price__multiselect-option">
          <input type="checkbox" class="rs-price__multiselect-checkbox" value="${a}" ${l}>
          <span>${this.formatPriceFull(a)}</span>
        </label>
      `;
    }), this.element.innerHTML = `
      <div class="rs-price__wrapper">
        <label class="rs-price__label">${this.type === "min" ? this.label("search_price_min") : this.label("search_price_max")}</label>
        <div class="rs-price__multiselect">
          <button type="button" class="rs-price__multiselect-button">
            <span class="rs-price__multiselect-text">${i}</span>
            <span class="rs-price__multiselect-arrow">▼</span>
          </button>
          <div class="rs-price__multiselect-dropdown" style="display: none;">
            ${r}
          </div>
        </div>
      </div>
    `, this.button = this.element.querySelector(".rs-price__multiselect-button"), this.buttonText = this.element.querySelector(".rs-price__multiselect-text"), this.dropdown = this.element.querySelector(".rs-price__multiselect-dropdown");
  }
  // VARIATION 4: Free Input
  renderFreeInput() {
    const e = this.type === "min" ? this.label("search_price_input_min") || "Min. Price (e.g., 200000)" : this.label("search_price_input_max") || "Max. Price (e.g., 500000)";
    this.element.innerHTML = `
      <div class="rs-price__wrapper">
        <label class="rs-price__label">${this.type === "min" ? this.label("search_price_min") : this.label("search_price_max")}</label>
        <div class="rs-price__input-wrapper">
          <span class="rs-price__currency">€</span>
          <input type="number"
                 class="rs-price__input"
                 min="0"
                 step="10000"
                 placeholder="${e}"
                 value="${this.currentValue || ""}">
        </div>
      </div>
    `, this.input = this.element.querySelector(".rs-price__input");
  }
  bindEvents() {
    switch (this.variation) {
      case "2":
        this.bindStackedButtonsEvents();
        break;
      case "3":
        this.bindMultiSelectEvents();
        break;
      case "4":
        this.bindFreeInputEvents();
        break;
      default:
        this.bindStyledDropdownEvents();
    }
    document.addEventListener("click", (e) => {
      this.element.contains(e.target) || this.hideDropdown();
    });
  }
  bindStyledDropdownEvents() {
    this.select && this.select.addEventListener("change", (e) => {
      const t = e.target, s = t.value ? parseInt(t.value) : null;
      this.setValue(s);
    });
  }
  bindStackedButtonsEvents() {
    this.toggleBtn && this.toggleBtn.addEventListener("click", (e) => {
      e.preventDefault(), e.stopPropagation(), this.toggleDropdown();
    }), this.dropdown && this.dropdown.addEventListener("click", (e) => {
      const s = e.target.closest(".rs-price__option");
      if (!s) return;
      e.preventDefault();
      const i = s.dataset.value ? parseInt(s.dataset.value) : null;
      this.dropdown.querySelectorAll(".rs-price__option").forEach(
        (a) => a.classList.remove("rs-price__option--active")
      ), i && s.classList.add("rs-price__option--active");
      const r = this.type === "min" ? this.label("search_price_min") || "Min. Price" : this.label("search_price_max") || "Max. Price";
      i && this.toggleText && this.toggleBtn ? (this.toggleText.textContent = this.formatPriceFull(i), this.toggleBtn.classList.add("rs-price__toggle--has-selection")) : this.toggleText && this.toggleBtn && (this.toggleText.textContent = r, this.toggleBtn.classList.remove("rs-price__toggle--has-selection")), this.hideDropdown(), this.setValue(i);
    });
  }
  bindMultiSelectEvents() {
    this.button && this.button.addEventListener("click", (e) => {
      e.preventDefault(), this.toggleDropdown();
    }), this.element.querySelectorAll(".rs-price__multiselect-checkbox").forEach((e) => {
      e.addEventListener("change", (t) => {
        const s = t.target, i = parseInt(s.value);
        s.checked ? this.selectedValues.add(i) : this.selectedValues.delete(i), this.updateMultiSelectButton(), this.updateMultiSelectFilter();
      });
    });
  }
  bindFreeInputEvents() {
    let e;
    this.input && (this.input.addEventListener("input", (t) => {
      clearTimeout(e), e = setTimeout(() => {
        const s = t.target, i = parseInt(s.value);
        this.setValue(i && i > 0 ? i : null);
      }, 300);
    }), this.input.addEventListener("blur", (t) => {
      const s = t.target, i = parseInt(s.value);
      i && i > 0 && (s.value = String(i));
    }));
  }
  setValue(e) {
    this.currentValue = e;
    const t = this.type === "min" ? "priceMin" : "priceMax";
    this.setFilter(t, e);
  }
  updateMultiSelectButton() {
    if (!this.buttonText) return;
    const e = this.type === "min" ? this.label("search_price_select_min") || "Select Min Prices" : this.label("search_price_select_max") || "Select Max Prices", t = this.selectedValues.size;
    this.buttonText.textContent = t > 0 ? t + " selected" : e;
  }
  updateMultiSelectFilter() {
    if (this.selectedValues.size > 0) {
      const e = Array.from(this.selectedValues).sort((s, i) => s - i), t = this.type === "min" ? Math.min(...e) : Math.max(...e);
      this.setValue(t);
    } else
      this.setValue(null);
  }
  updatePriceOptions() {
    this.render(), this.bindEvents();
  }
  showDropdown() {
    this.dropdown && (this.isOpen = !0, this.dropdown.style.display = "block");
  }
  hideDropdown() {
    this.dropdown && (this.isOpen = !1, this.dropdown.style.display = "none");
  }
  toggleDropdown() {
    this.isOpen ? this.hideDropdown() : this.showDropdown();
  }
  updateDisplay() {
    var e, t;
    if (this.select && (this.select.value = ((e = this.currentValue) == null ? void 0 : e.toString()) || ""), this.toggleText && this.toggleBtn) {
      const s = this.type === "min" ? this.label("search_price_min") || "Min. Price" : this.label("search_price_max") || "Max. Price";
      this.currentValue ? (this.toggleText.textContent = this.formatPriceFull(this.currentValue), this.toggleBtn.classList.add("rs-price__toggle--has-selection")) : (this.toggleText.textContent = s, this.toggleBtn.classList.remove("rs-price__toggle--has-selection"));
    }
    this.input && (this.input.value = ((t = this.currentValue) == null ? void 0 : t.toString()) || ""), this.variation === "3" && (this.currentValue || this.selectedValues.clear(), this.element.querySelectorAll(".rs-price__multiselect-checkbox").forEach((s) => {
      const i = parseInt(s.value);
      s.checked = this.selectedValues.has(i);
    })), this.updateMultiSelectButton();
  }
}
RealtySoft.registerComponent("rs_price", at);
class lt extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "lockedMode", !1);
    o(this, "minValue", null);
    o(this, "maxValue", null);
    this.init();
  }
  init() {
    this.lockedMode = this.isLocked("builtMin") || this.isLocked("builtMax"), this.minValue = this.getFilter("builtMin"), this.maxValue = this.getFilter("builtMax"), this.render(), this.lockedMode ? this.applyLockedStyle() : this.bindEvents(), this.subscribe("filters.builtMin", (e) => {
      this.minValue = e, this.updateDisplay();
    }), this.subscribe("filters.builtMax", (e) => {
      this.maxValue = e, this.updateDisplay();
    });
  }
  render() {
    switch (this.element.classList.add("rs-built-area", `rs-built-area--v${this.variation}`), this.variation) {
      case "2":
        this.renderSlider();
        break;
      default:
        this.renderInputs();
    }
  }
  renderInputs() {
    this.element.innerHTML = `
      <div class="rs-built-area__wrapper">
        <label class="rs-built-area__label">${this.label("search_built_area")}</label>
        <div class="rs-built-area__inputs">
          <div class="rs-built-area__input-group">
            <input type="number"
                   class="rs-built-area__input rs-built-area__input--min"
                   placeholder="${this.label("search_min")}"
                   value="${this.minValue || ""}"
                   min="0"
                   step="10">
            <span class="rs-built-area__unit">m²</span>
          </div>
          <span class="rs-built-area__separator">-</span>
          <div class="rs-built-area__input-group">
            <input type="number"
                   class="rs-built-area__input rs-built-area__input--max"
                   placeholder="${this.label("search_max")}"
                   value="${this.maxValue || ""}"
                   min="0"
                   step="10">
            <span class="rs-built-area__unit">m²</span>
          </div>
        </div>
      </div>
    `;
  }
  renderSlider() {
    const e = this.minValue || 0, t = this.maxValue || 1e3;
    this.element.innerHTML = `
      <div class="rs-built-area__wrapper">
        <label class="rs-built-area__label">${this.label("search_built_area")}</label>
        <div class="rs-built-area__slider-wrapper">
          <div class="rs-built-area__slider-values">
            <span class="rs-built-area__slider-min">${e} m²</span>
            <span class="rs-built-area__slider-max">${t >= 1e3 ? "1000+ m²" : t + " m²"}</span>
          </div>
          <div class="rs-built-area__slider-track">
            <input type="range" class="rs-built-area__slider rs-built-area__slider--min"
                   min="0" max="1000" step="10" value="${e}">
            <input type="range" class="rs-built-area__slider rs-built-area__slider--max"
                   min="0" max="1000" step="10" value="${t}">
          </div>
        </div>
      </div>
    `;
  }
  bindEvents() {
    const e = this.element.querySelector(".rs-built-area__input--min"), t = this.element.querySelector(".rs-built-area__input--max");
    e && e.addEventListener("change", (r) => {
      const a = r.target, l = a.value ? parseInt(a.value) : null;
      this.setFilter("builtMin", l);
    }), t && t.addEventListener("change", (r) => {
      const a = r.target, l = a.value ? parseInt(a.value) : null;
      this.setFilter("builtMax", l);
    });
    const s = this.element.querySelector(".rs-built-area__slider--min"), i = this.element.querySelector(".rs-built-area__slider--max");
    s && s.addEventListener("input", (r) => {
      const a = r.target;
      let l = parseInt(a.value);
      i && l > parseInt(i.value) && (l = parseInt(i.value), a.value = String(l)), this.setFilter("builtMin", l || null), this.updateSliderDisplay();
    }), i && i.addEventListener("input", (r) => {
      const a = r.target;
      let l = parseInt(a.value);
      s && l < parseInt(s.value) && (l = parseInt(s.value), a.value = String(l)), this.setFilter("builtMax", l >= 1e3 ? null : l), this.updateSliderDisplay();
    });
  }
  updateDisplay() {
    var s, i;
    const e = this.element.querySelector(".rs-built-area__input--min"), t = this.element.querySelector(".rs-built-area__input--max");
    e && (e.value = ((s = this.minValue) == null ? void 0 : s.toString()) || ""), t && (t.value = ((i = this.maxValue) == null ? void 0 : i.toString()) || ""), this.updateSliderDisplay();
  }
  updateSliderDisplay() {
    const e = this.element.querySelector(".rs-built-area__slider-min"), t = this.element.querySelector(".rs-built-area__slider-max"), s = this.element.querySelector(".rs-built-area__slider--min"), i = this.element.querySelector(".rs-built-area__slider--max");
    if (e && s && (e.textContent = `${s.value} m²`), t && i) {
      const r = parseInt(i.value);
      t.textContent = r >= 1e3 ? "1000+ m²" : `${r} m²`;
    }
  }
}
RealtySoft.registerComponent("rs_built_area", lt);
class nt extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "lockedMode", !1);
    o(this, "minValue", null);
    o(this, "maxValue", null);
    this.init();
  }
  init() {
    this.lockedMode = this.isLocked("plotMin") || this.isLocked("plotMax"), this.minValue = this.getFilter("plotMin"), this.maxValue = this.getFilter("plotMax"), this.render(), this.lockedMode ? this.applyLockedStyle() : this.bindEvents(), this.subscribe("filters.plotMin", (e) => {
      this.minValue = e, this.updateDisplay();
    }), this.subscribe("filters.plotMax", (e) => {
      this.maxValue = e, this.updateDisplay();
    });
  }
  render() {
    switch (this.element.classList.add("rs-plot-size", `rs-plot-size--v${this.variation}`), this.variation) {
      case "2":
        this.renderSlider();
        break;
      default:
        this.renderInputs();
    }
  }
  renderInputs() {
    this.element.innerHTML = `
      <div class="rs-plot-size__wrapper">
        <label class="rs-plot-size__label">${this.label("search_plot_size")}</label>
        <div class="rs-plot-size__inputs">
          <div class="rs-plot-size__input-group">
            <input type="number"
                   class="rs-plot-size__input rs-plot-size__input--min"
                   placeholder="${this.label("search_min")}"
                   value="${this.minValue || ""}"
                   min="0"
                   step="100">
            <span class="rs-plot-size__unit">m²</span>
          </div>
          <span class="rs-plot-size__separator">-</span>
          <div class="rs-plot-size__input-group">
            <input type="number"
                   class="rs-plot-size__input rs-plot-size__input--max"
                   placeholder="${this.label("search_max")}"
                   value="${this.maxValue || ""}"
                   min="0"
                   step="100">
            <span class="rs-plot-size__unit">m²</span>
          </div>
        </div>
      </div>
    `;
  }
  renderSlider() {
    const e = this.minValue || 0, t = this.maxValue || 1e4;
    this.element.innerHTML = `
      <div class="rs-plot-size__wrapper">
        <label class="rs-plot-size__label">${this.label("search_plot_size")}</label>
        <div class="rs-plot-size__slider-wrapper">
          <div class="rs-plot-size__slider-values">
            <span class="rs-plot-size__slider-min">${this.formatArea(e)}</span>
            <span class="rs-plot-size__slider-max">${t >= 1e4 ? "10,000+ m²" : this.formatArea(t)}</span>
          </div>
          <div class="rs-plot-size__slider-track">
            <input type="range" class="rs-plot-size__slider rs-plot-size__slider--min"
                   min="0" max="10000" step="100" value="${e}">
            <input type="range" class="rs-plot-size__slider rs-plot-size__slider--max"
                   min="0" max="10000" step="100" value="${t}">
          </div>
        </div>
      </div>
    `;
  }
  bindEvents() {
    const e = this.element.querySelector(".rs-plot-size__input--min"), t = this.element.querySelector(".rs-plot-size__input--max");
    e && e.addEventListener("change", (r) => {
      const a = r.target, l = a.value ? parseInt(a.value) : null;
      this.setFilter("plotMin", l);
    }), t && t.addEventListener("change", (r) => {
      const a = r.target, l = a.value ? parseInt(a.value) : null;
      this.setFilter("plotMax", l);
    });
    const s = this.element.querySelector(".rs-plot-size__slider--min"), i = this.element.querySelector(".rs-plot-size__slider--max");
    s && s.addEventListener("input", (r) => {
      const a = r.target;
      let l = parseInt(a.value);
      i && l > parseInt(i.value) && (l = parseInt(i.value), a.value = String(l)), this.setFilter("plotMin", l || null), this.updateSliderDisplay();
    }), i && i.addEventListener("input", (r) => {
      const a = r.target;
      let l = parseInt(a.value);
      s && l < parseInt(s.value) && (l = parseInt(s.value), a.value = String(l)), this.setFilter("plotMax", l >= 1e4 ? null : l), this.updateSliderDisplay();
    });
  }
  formatArea(e) {
    return e ? `${e.toLocaleString()} m²` : "0 m²";
  }
  updateDisplay() {
    var s, i;
    const e = this.element.querySelector(".rs-plot-size__input--min"), t = this.element.querySelector(".rs-plot-size__input--max");
    e && (e.value = ((s = this.minValue) == null ? void 0 : s.toString()) || ""), t && (t.value = ((i = this.maxValue) == null ? void 0 : i.toString()) || ""), this.updateSliderDisplay();
  }
  updateSliderDisplay() {
    const e = this.element.querySelector(".rs-plot-size__slider-min"), t = this.element.querySelector(".rs-plot-size__slider-max"), s = this.element.querySelector(".rs-plot-size__slider--min"), i = this.element.querySelector(".rs-plot-size__slider--max");
    if (e && s && (e.textContent = this.formatArea(parseInt(s.value))), t && i) {
      const r = parseInt(i.value);
      t.textContent = r >= 1e4 ? "10,000+ m²" : this.formatArea(r);
    }
  }
}
RealtySoft.registerComponent("rs_plot_size", nt);
class ot extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "lockedMode", !1);
    o(this, "features", []);
    o(this, "selectedFeatures", /* @__PURE__ */ new Set());
    o(this, "isOpen", !1);
    o(this, "searchTerm", "");
    o(this, "expandedCategories", /* @__PURE__ */ new Set());
    o(this, "isLoadingFeatures", !1);
    o(this, "overlay", null);
    o(this, "trigger", null);
    o(this, "triggerText", null);
    o(this, "modal", null);
    o(this, "searchInput", null);
    o(this, "categoriesContainer", null);
    this.init();
  }
  init() {
    this.lockedMode = this.isLocked("features"), this.features = RealtySoftState.get("data.features") || [], this.selectedFeatures = new Set(this.getFilter("features") || []), this.isOpen = !1, this.searchTerm = "", this.expandedCategories = /* @__PURE__ */ new Set(), this.isLoadingFeatures = !1, this.render(), this.lockedMode ? this.applyLockedStyle() : this.bindEvents(), this.subscribe("data.features", (e) => {
      this.features = e, this.updateCategoryList();
    }), this.subscribe("filters.features", (e) => {
      this.selectedFeatures = new Set(e || []), this.updateDisplay();
    });
  }
  /**
   * Load features on demand (when user clicks button)
   * Only loads if not already loaded, caches in localStorage via API
   */
  async loadFeaturesOnDemand() {
    if (!(RealtySoftState.get("data.featuresLoaded") || this.isLoadingFeatures)) {
      this.isLoadingFeatures = !0, console.log("[RealtySoft] Loading features on demand...");
      try {
        const e = await RealtySoftAPI.getFeatures();
        RealtySoftState.set("data.features", e.data || []), RealtySoftState.set("data.featuresLoaded", !0), this.features = e.data || [], console.log("[RealtySoft] Features loaded on demand:", this.features.length);
      } catch (e) {
        console.error("[RealtySoft] Failed to load features:", e);
      } finally {
        this.isLoadingFeatures = !1;
      }
    }
  }
  // Build parent-child map from API structure
  // API returns: [{id, name, value_ids: [{id, name}, ...]}, ...]
  buildFeatureMap() {
    return this.features.filter((e) => e.value_ids && e.value_ids.length > 0).map((e) => ({
      id: e.id,
      name: e.name,
      children: (e.value_ids || []).sort(
        (t, s) => (t.name || "").localeCompare(s.name || "")
      )
    })).sort((e, t) => (e.name || "").localeCompare(t.name || ""));
  }
  // Filter features by search term
  getFilteredFeatureMap() {
    const e = this.buildFeatureMap();
    if (!this.searchTerm)
      return e;
    const t = this.searchTerm.toLowerCase(), s = [];
    return e.forEach((i) => {
      const r = (i.name || "").toLowerCase().includes(t), a = i.children.filter(
        (l) => (l.name || "").toLowerCase().includes(t)
      );
      (r || a.length > 0) && s.push({
        ...i,
        children: r ? i.children : a
      });
    }), s;
  }
  render() {
    this.element.classList.add("rs-features");
    const e = this.selectedFeatures.size, t = e > 0 ? e + " feature" + (e > 1 ? "s" : "") + " selected" : this.label("search_features_placeholder") || "Select Features";
    this.element.innerHTML = `
      <div class="rs-features__wrapper">
        <label class="rs-features__label">${this.label("search_features")}</label>
        <button type="button" class="rs-features__trigger">
          <span class="rs-features__trigger-text">${t}</span>
          <span class="rs-features__trigger-arrow">▼</span>
        </button>
      </div>
    `, this.overlay = document.createElement("div"), this.overlay.className = "rs-features__overlay", this.overlay.style.display = "none", this.overlay.innerHTML = `
      <div class="rs-features__modal">
        <div class="rs-features__modal-header">
          <h3 class="rs-features__modal-title">${this.label("search_features")}</h3>
          <button type="button" class="rs-features__modal-close">&times;</button>
        </div>
        <div class="rs-features__modal-search">
          <input type="text"
                 class="rs-features__search"
                 placeholder="${this.label("search_features_filter") || "Search features..."}"
                 autocomplete="off">
        </div>
        <div class="rs-features__modal-body">
          <div class="rs-features__categories"></div>
        </div>
        <div class="rs-features__modal-footer">
          <button type="button" class="rs-features__clear-btn">${this.label("general_clear") || "Clear"}</button>
          <button type="button" class="rs-features__done-btn">${this.label("general_close") || "Done"}</button>
        </div>
      </div>
    `, document.body.appendChild(this.overlay), this.trigger = this.element.querySelector(".rs-features__trigger"), this.triggerText = this.element.querySelector(".rs-features__trigger-text"), this.modal = this.overlay.querySelector(".rs-features__modal"), this.searchInput = this.overlay.querySelector(".rs-features__search"), this.categoriesContainer = this.overlay.querySelector(".rs-features__categories"), this.updateCategoryList();
  }
  updateCategoryList() {
    if (!this.categoriesContainer) return;
    const e = this.getFilteredFeatureMap();
    if (e.length === 0) {
      this.categoriesContainer.innerHTML = `
        <div class="rs-features__empty">No features found</div>
      `;
      return;
    }
    let t = "";
    e.forEach((s) => {
      const i = s.id.toString(), r = this.expandedCategories.has(i) || !!this.searchTerm, a = s.children.filter((l) => this.selectedFeatures.has(l.id)).length;
      t += `
        <div class="rs-features__category ${r ? "rs-features__category--expanded" : ""}">
          <div class="rs-features__category-header" data-category="${i}">
            <span class="rs-features__category-toggle">${r ? "−" : "+"}</span>
            <span class="rs-features__category-name">${this.escapeHtml(s.name)}</span>
            ${a > 0 ? `<span class="rs-features__category-count">${a}</span>` : ""}
          </div>
          <div class="rs-features__category-items" style="display: ${r ? "block" : "none"}">
      `, s.children.forEach((l) => {
        const d = this.selectedFeatures.has(l.id);
        t += `
          <label class="rs-features__item">
            <input type="checkbox"
                   class="rs-features__checkbox"
                   value="${l.id}"
                   ${d ? "checked" : ""}>
            <span class="rs-features__item-name">${this.escapeHtml(l.name)}</span>
          </label>
        `;
      }), t += `
          </div>
        </div>
      `;
    }), this.categoriesContainer.innerHTML = t;
  }
  bindEvents() {
    if (this.trigger && this.trigger.addEventListener("click", (e) => {
      e.preventDefault(), this.showModal();
    }), this.searchInput && this.searchInput.addEventListener("input", (e) => {
      const t = e.target;
      this.searchTerm = t.value.trim(), this.updateCategoryList();
    }), this.categoriesContainer && (this.categoriesContainer.addEventListener("click", (e) => {
      const s = e.target.closest(".rs-features__category-header");
      if (s) {
        const i = s.dataset.category;
        i && this.toggleCategory(i);
      }
    }), this.categoriesContainer.addEventListener("change", (e) => {
      const t = e.target;
      if (t.classList.contains("rs-features__checkbox")) {
        const s = parseInt(t.value);
        t.checked ? this.selectedFeatures.add(s) : this.selectedFeatures.delete(s), this.updateFilters(), this.updateTriggerText(), this.updateCategoryList();
      }
    })), this.overlay) {
      const e = this.overlay.querySelector(".rs-features__clear-btn");
      e && e.addEventListener("click", () => {
        this.clearAll();
      });
      const t = this.overlay.querySelector(".rs-features__done-btn");
      t && t.addEventListener("click", () => {
        this.hideModal();
      });
      const s = this.overlay.querySelector(".rs-features__modal-close");
      s && s.addEventListener("click", () => {
        this.hideModal();
      }), this.overlay.addEventListener("click", (i) => {
        i.target === this.overlay && this.hideModal();
      });
    }
    document.addEventListener("keydown", (e) => {
      e.key === "Escape" && this.isOpen && this.hideModal();
    });
  }
  toggleCategory(e) {
    var a;
    const t = (a = this.categoriesContainer) == null ? void 0 : a.querySelector(`.rs-features__category-header[data-category="${e}"]`);
    if (!t) return;
    const s = t.parentElement;
    if (!s) return;
    const i = s.querySelector(".rs-features__category-items"), r = s.querySelector(".rs-features__category-toggle");
    !i || !r || (this.expandedCategories.has(e) ? (this.expandedCategories.delete(e), s.classList.remove("rs-features__category--expanded"), i.style.display = "none", r.textContent = "+") : (this.expandedCategories.add(e), s.classList.add("rs-features__category--expanded"), i.style.display = "block", r.textContent = "−"));
  }
  async showModal() {
    this.isOpen = !0, this.overlay && (this.overlay.style.display = "flex"), document.body.style.overflow = "hidden", RealtySoftState.get("data.featuresLoaded") || (this.categoriesContainer && (this.categoriesContainer.innerHTML = '<div class="rs-features__loading">Loading features...</div>'), await this.loadFeaturesOnDemand(), this.updateCategoryList()), this.searchInput && this.searchInput.focus();
  }
  hideModal() {
    this.isOpen = !1, this.overlay && (this.overlay.style.display = "none"), document.body.style.overflow = "", this.searchTerm = "", this.searchInput && (this.searchInput.value = ""), this.updateCategoryList();
  }
  updateFilters() {
    const e = Array.from(this.selectedFeatures);
    this.setFilter("features", e.length > 0 ? e : []);
  }
  updateTriggerText() {
    if (!this.triggerText) return;
    const e = this.selectedFeatures.size;
    this.triggerText.textContent = e > 0 ? e + " feature" + (e > 1 ? "s" : "") + " selected" : this.label("search_features_placeholder") || "Select Features";
  }
  clearAll() {
    this.selectedFeatures.clear(), this.updateFilters(), this.updateTriggerText(), this.updateCategoryList();
  }
  updateDisplay() {
    this.updateTriggerText(), this.updateCategoryList();
  }
  escapeHtml(e) {
    if (!e) return "";
    const t = document.createElement("div");
    return t.textContent = e, t.innerHTML;
  }
}
RealtySoft.registerComponent("rs_features", ot);
class ct extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "lockedMode", !1);
    o(this, "value", "");
    o(this, "input", null);
    o(this, "clearBtn", null);
    this.init();
  }
  init() {
    this.lockedMode = this.isLocked("ref"), this.value = this.getFilter("ref") || "", this.render(), this.lockedMode ? this.applyLockedStyle() : this.bindEvents(), this.subscribe("filters.ref", (e) => {
      this.value = e || "", this.updateDisplay();
    });
  }
  render() {
    this.element.classList.add("rs-reference"), this.element.innerHTML = `
      <div class="rs-reference__wrapper">
        <label class="rs-reference__label">${this.label("search_reference")}</label>
        <div class="rs-reference__input-wrapper">
          <input type="text"
                 class="rs-reference__input"
                 placeholder="${this.label("search_reference")}"
                 value="${this.value}"
                 autocomplete="off">
          ${this.value ? '<button class="rs-reference__clear" type="button">&times;</button>' : ""}
        </div>
      </div>
    `, this.input = this.element.querySelector(".rs-reference__input"), this.clearBtn = this.element.querySelector(".rs-reference__clear");
  }
  bindEvents() {
    let e;
    this.input && (this.input.addEventListener("input", (t) => {
      clearTimeout(e), e = setTimeout(() => {
        const s = t.target;
        this.setFilter("ref", s.value.trim() || ""), this.updateClearButton();
      }, 300);
    }), this.input.addEventListener("keydown", (t) => {
      t.key === "Enter" && (t.preventDefault(), this.setFilter("ref", this.input.value.trim() || ""), RealtySoft.search());
    })), this.clearBtn && this.clearBtn.addEventListener("click", () => {
      this.input && (this.input.value = ""), this.setFilter("ref", ""), this.updateClearButton();
    });
  }
  updateDisplay() {
    this.input && (this.input.value = this.value), this.updateClearButton();
  }
  updateClearButton() {
    let e = this.element.querySelector(".rs-reference__clear");
    const t = this.input && this.input.value.trim();
    if (t && !e) {
      e = document.createElement("button"), e.className = "rs-reference__clear", e.type = "button", e.innerHTML = "&times;", e.addEventListener("click", () => {
        this.input && (this.input.value = ""), this.setFilter("ref", ""), this.updateClearButton();
      });
      const s = this.element.querySelector(".rs-reference__input-wrapper");
      s && s.appendChild(e);
    } else !t && e && e.remove();
  }
}
RealtySoft.registerComponent("rs_ref", ct);
class dt extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "isLoading", !1);
    o(this, "propertyCount", null);
    o(this, "countDebounce", null);
    o(this, "button", null);
    o(this, "text", null);
    o(this, "countEl", null);
    o(this, "loader", null);
    o(this, "icon", null);
    this.init();
  }
  init() {
    this.isLoading = !1, this.propertyCount = null, this.countDebounce = null, this.render(), this.bindEvents(), this.subscribe("ui.loading", (e) => {
      this.isLoading = e, this.updateDisplay();
    }), this.subscribe("filters", (e, t, s) => {
      console.log("[RealtySoft] Search button: filters changed", { path: s, filters: e }), this.fetchCount();
    }), this.fetchCount();
  }
  render() {
    this.element.classList.add("rs-search-button"), this.element.innerHTML = `
      <button type="button" class="rs-search-button__btn">
        <span class="rs-search-button__text">${this.label("search_button")}</span>
        <span class="rs-search-button__count"></span>
        <span class="rs-search-button__loader" style="display: none;">
          <svg class="rs-search-button__spinner" width="20" height="20" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-dasharray="31.4 31.4">
              <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
            </circle>
          </svg>
        </span>
        <span class="rs-search-button__icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="M21 21l-4.35-4.35"></path>
          </svg>
        </span>
      </button>
    `, this.button = this.element.querySelector(".rs-search-button__btn"), this.text = this.element.querySelector(".rs-search-button__text"), this.countEl = this.element.querySelector(".rs-search-button__count"), this.loader = this.element.querySelector(".rs-search-button__loader"), this.icon = this.element.querySelector(".rs-search-button__icon");
  }
  bindEvents() {
    this.button && this.button.addEventListener("click", (e) => {
      e.preventDefault(), this.isLoading || RealtySoft.search();
    });
  }
  async fetchCount() {
    this.countDebounce && clearTimeout(this.countDebounce), this.countDebounce = setTimeout(async () => {
      try {
        const e = RealtySoftState.getSearchParams();
        e.limit = 1, e.page = 1, console.log("[RealtySoft] Search button: fetching count with params", JSON.stringify(e));
        const t = await RealtySoftAPI.searchProperties(e);
        console.log("[RealtySoft] Search button: API result", t);
        const s = t;
        this.propertyCount = t.total || s.count || s.total_count || s.totalCount || s.total_results || (t.data ? t.data.length : 0) || 0, console.log("[RealtySoft] Search button: count =", this.propertyCount), this.updateCountDisplay();
      } catch (e) {
        console.warn("Could not fetch property count:", e), this.propertyCount = null, this.updateCountDisplay();
      }
    }, 500);
  }
  updateCountDisplay() {
    this.countEl && this.propertyCount !== null && !this.isLoading ? (this.countEl.textContent = "(" + this.propertyCount + ")", this.countEl.style.display = "inline") : this.countEl && (this.countEl.style.display = "none");
  }
  updateDisplay() {
    this.isLoading ? (this.button && (this.button.disabled = !0), this.button && this.button.classList.add("rs-search-button__btn--loading"), this.loader && (this.loader.style.display = "inline-block"), this.icon && (this.icon.style.display = "none"), this.countEl && (this.countEl.style.display = "none"), this.text && (this.text.textContent = this.label("results_loading"))) : (this.button && (this.button.disabled = !1), this.button && this.button.classList.remove("rs-search-button__btn--loading"), this.loader && (this.loader.style.display = "none"), this.icon && (this.icon.style.display = "inline-block"), this.text && (this.text.textContent = this.label("search_button")), this.updateCountDisplay());
  }
}
RealtySoft.registerComponent("rs_search_button", dt);
class ht extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "button", null);
    this.init();
  }
  init() {
    this.render(), this.bindEvents();
  }
  render() {
    this.element.classList.add("rs-reset-button"), this.element.innerHTML = `
      <button type="button" class="rs-reset-button__btn">
        <span class="rs-reset-button__icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
            <path d="M3 3v5h5"></path>
          </svg>
        </span>
        <span class="rs-reset-button__text">${this.label("search_reset")}</span>
      </button>
    `, this.button = this.element.querySelector(".rs-reset-button__btn");
  }
  bindEvents() {
    this.button && this.button.addEventListener("click", (e) => {
      e.preventDefault(), RealtySoft.reset();
    });
  }
}
RealtySoft.registerComponent("rs_reset_button", ht);
const xe = "https://realtysoft.ai/propertymanager/php";
class Pe extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "isAIMode", !1);
    o(this, "isPremium", !1);
    o(this, "isLoading", !1);
    o(this, "searchContainer", null);
    o(this, "searchFormElements", []);
    o(this, "toggleBtn", null);
    o(this, "aiModeEl", null);
    o(this, "textarea", null);
    o(this, "searchBtn", null);
    o(this, "errorEl", null);
    o(this, "closeBtn", null);
    this.init();
  }
  async init() {
    if (this.searchContainer = this.element.closest("#rs_search") || this.element.closest(".rs-search") || this.element.closest('[class*="rs-template-search"]'), this.searchContainer || (this.searchContainer = document.getElementById("rs_search") || document.querySelector(".rs-search") || document.querySelector('[class*="rs-template-search"]')), this.searchContainer) {
      [
        ".search-grid",
        '[class*="__row"]',
        ".rs-search__form",
        '[class*="search-01__"]',
        '[class*="search-02__"]',
        '[class*="search-03__"]'
      ].forEach((s) => {
        this.searchContainer.querySelectorAll(s).forEach((r) => {
          !r.classList.contains("rs-ai-mode") && !r.closest(".rs-ai-mode") && this.searchFormElements.push(r);
        });
      });
      const t = this.searchContainer.children;
      for (let s = 0; s < t.length; s++) {
        const i = t[s];
        i.tagName !== "BUTTON" && !i.classList.contains("rs-ai-toggle") && !i.classList.contains("rs-ai-mode") && !i.classList.contains("rs_ai_search_toggle") && (this.searchFormElements.includes(i) || this.searchFormElements.push(i));
      }
    }
    await this.checkPremiumStatus(), this.isPremium && (this.render(), this.bindEvents(), this.subscribe("config.language", () => {
      this.updateLabels();
    }), this.subscribe("labels", () => {
      this.updateLabels();
    }), setTimeout(() => this.updateLabels(), 500));
  }
  /**
   * Update labels when language changes
   */
  updateLabels() {
    var l, d;
    if (!this.aiModeEl) return;
    const e = this.aiModeEl.querySelector(".rs-ai-mode__title");
    if (e) {
      const y = ((l = e.querySelector("svg")) == null ? void 0 : l.outerHTML) || "";
      e.innerHTML = y + " " + this.label("ai_search_title");
    }
    const t = this.aiModeEl.querySelector(".rs-ai-mode__close");
    if (t) {
      const y = ((d = t.querySelector("svg")) == null ? void 0 : d.outerHTML) || "";
      t.innerHTML = y + " " + this.label("ai_search_back");
    }
    this.textarea && (this.textarea.placeholder = this.label("ai_search_placeholder"));
    const s = this.aiModeEl.querySelector(".rs-ai-mode__search-text");
    s && (s.textContent = this.label("ai_search_button"));
    const i = this.aiModeEl.querySelector(".rs-ai-mode__examples-label");
    i && (i.textContent = this.label("ai_search_try"));
    const r = this.aiModeEl.querySelectorAll(".rs-ai-mode__examples button"), a = [
      this.label("ai_search_example_1"),
      this.label("ai_search_example_2"),
      this.label("ai_search_example_3")
    ];
    r.forEach((y, p) => {
      a[p] && (y.textContent = a[p], y.dataset.query = a[p]);
    });
  }
  async checkPremiumStatus() {
    try {
      const t = await (await fetch(`${xe}/ai-search.php?action=check`)).json();
      this.isPremium = t.enabled === !0;
    } catch (e) {
      console.warn("[RealtySoft] Could not check AI search status:", e), this.isPremium = !1;
    }
  }
  render() {
    this.toggleBtn = document.createElement("button"), this.toggleBtn.type = "button", this.toggleBtn.className = "rs-ai-toggle", this.toggleBtn.title = "Search with AI";
    const e = `
      <svg class="rs-ai-toggle__icon" viewBox="0 0 512 512" fill="currentColor">
        <path d="M207 116c3.125.375 3.125.375 6 1 .407 1.143.815 2.285 1.234 3.462 1.55 4.34 3.114 8.676 4.68 13.011.67 1.857 1.336 3.716 1.998 5.576 7.89 22.138 16.874 41.837 32.088 59.95.625.76 1.25 1.521 1.894 2.305 5.112 6.017 10.859 10.89 17.106 15.696.877.68 1.753 1.361 2.656 2.062 19.72 14.848 42.634 22.021 65.687 30.158.99.351 1.982.703 3.004 1.065 1.315.462 1.315.462 2.66.934 2 1 2 1 3 2 .041 2 .043 4 0 6-7.937 3.3-15.937 6.355-24.029 9.252-22.028 7.896-42.65 16.484-59.908 32.806-2.062 1.941-2.062 1.941-5.125 4.316-22.932 20.492-33.373 50.783-42.758 79.078-.26.757-.519 1.513-.786 2.292-.648 1.897-1.265 3.803-1.879 5.711-1.512 2.543-1.512 2.543-4.68 3.43-.934.037-1.869.074-2.832.113-2.888-4.34-4.5-8.83-6.187-13.719-.617-1.745-1.233-3.49-1.851-5.235-.48-1.36-.48-1.36-.968-2.748-7.493-21.132-15.167-41.117-30-58.297-.785-.911-1.57-1.823-2.379-2.762-2.167-2.454-4.38-4.853-6.621-7.239-.525-.589-1.05-1.178-1.59-1.785-17.1-18.406-41.271-27.711-64.286-35.875-.68-.248-1.361-.496-2.062-.752-3.408-1.241-6.819-2.474-10.235-3.695-1.258-.453-2.515-.907-3.773-1.36-1.679-.6-1.679-.6-3.391-1.21C71 288 71 288 69 286c-.187-2.375-.187-2.375 1-5 6.85-4.182 15.263-6.3 22.812-8.972 39.813-14.151 73.785-35.85 93.106-75.027 5.396-11.743 9.498-24.088 13.776-36.27.505-1.434.505-1.434 1.019-2.894.639-1.82 1.273-3.641 1.9-5.465.285-.814.57-1.628.863-2.467.378-1.094.378-1.094.763-2.199C205 148 205 148 207 116z"/>
        <path d="M369 32c1.65 0 3.3 0 5 0 .241.67.482 1.339.731 2.029 1.122 3.098 2.258 6.191 3.394 9.283.379 1.053.758 2.105 1.148 3.19 7.313 19.806 18.447 34.976 37.907 44.188 6.3 2.888 12.812 5.172 19.44 7.184C439.711 98.543 439.711 98.543 443 100c.976 2.176.976 2.176 1 4-5.122 2.371-10.282 4.499-15.565 6.48-12.4 4.679-21.887 10.166-31.435 21.52-.628.591-1.256 1.183-1.902 1.793-9.124 9.372-13.724 22.963-17.66 35.176-.262.772-.524 1.545-.79 2.341-.221.689-.442 1.378-.67 2.088-1 1.604-1 1.604-3.103 2.334-.939.133-.939.133-1.897.27-.71-1.687-1.418-3.375-2.125-5.063-.459-1.094-.918-2.188-1.39-3.316-1.254-3.059-2.448-6.133-3.627-9.223-8.078-20.927-20.123-34.186-40.527-43.463-4.998-2.135-10.129-3.947-15.292-5.65-.772-.267-1.545-.535-2.34-.81-.689-.223-1.378-.445-2.09-.687-1.603-1-1.603-1-2.603-4 2.948-2.423 5.656-3.77 9.254-5.016 1.03-.36 2.06-.722 3.124-1.093 1.067-.378 2.135-.755 3.234-1.143 8.531-3.114 16.281-6.047 23.438-12.75.778-.602 1.556-1.204 2.359-1.824C357.736 68.457 363.91 50.308 370 32z"/>
        <path d="M370 338c1.928.127 1.928.127 4 1 1.185 2.142 1.185 2.142 2.148 4.961.366 1.03.732 2.06 1.11 3.121.369 1.087.737 2.174 1.117 3.293 7.014 20.365 17.553 35.917 37 46.125 6.636 3.234 13.472 5.739 20.492 8.016.782.267 1.565.534 2.371.81.702.228 1.404.455 2.127.69C442 407 442 407 442.735 409.105c.088.625.175 1.251.265 1.895-6.147 2.603-12.3 5.125-18.562 7.438-19.377 7.46-33.31 19.545-41.97 38.61-3.25 7.489-5.882 15.213-8.468 22.952-1.65 0-3.3 0-5 0-.211-.604-.422-1.207-.64-1.829-9.045-25.749-18.186-45.286-43.82-57.671-5.315-2.264-10.747-4.206-16.21-6.06-1.184-.413-1.184-.413-2.392-.822-.71-.239-1.419-.478-2.149-.725-1.781-.888-1.781-.888-3.781-3.888 1.416-2.832 3.005-2.91 5.961-3.953 1.03-.373 2.06-.745 3.121-1.129 1.067-.372 2.134-.743 3.232-1.125 20.766-7.52 35.026-19.135 44.488-39.16 2.912-6.448 5.27-13.107 7.613-19.777C366 339 366 339 370 338z"/>
      </svg>
    `;
    this.toggleBtn.innerHTML = e, this.searchContainer && (this.searchContainer.style.position = "relative", this.searchContainer.appendChild(this.toggleBtn));
    const t = this.label("ai_search_title"), s = this.label("ai_search_back"), i = this.label("ai_search_placeholder"), r = this.label("ai_search_try"), a = this.label("ai_search_button"), l = this.label("ai_search_example_1"), d = this.label("ai_search_example_2"), y = this.label("ai_search_example_3");
    this.aiModeEl = document.createElement("div"), this.aiModeEl.className = "rs-ai-mode", this.aiModeEl.style.display = "none", this.aiModeEl.innerHTML = `
      <div class="rs-ai-mode__header">
        <span class="rs-ai-mode__title">
          <svg class="rs-ai-mode__title-icon" viewBox="0 0 512 512" fill="currentColor" width="24" height="24">
            <path d="M207 116c3.125.375 3.125.375 6 1 .407 1.143.815 2.285 1.234 3.462 1.55 4.34 3.114 8.676 4.68 13.011.67 1.857 1.336 3.716 1.998 5.576 7.89 22.138 16.874 41.837 32.088 59.95.625.76 1.25 1.521 1.894 2.305 5.112 6.017 10.859 10.89 17.106 15.696.877.68 1.753 1.361 2.656 2.062 19.72 14.848 42.634 22.021 65.687 30.158.99.351 1.982.703 3.004 1.065 1.315.462 1.315.462 2.66.934 2 1 2 1 3 2 .041 2 .043 4 0 6-7.937 3.3-15.937 6.355-24.029 9.252-22.028 7.896-42.65 16.484-59.908 32.806-2.062 1.941-2.062 1.941-5.125 4.316-22.932 20.492-33.373 50.783-42.758 79.078-.26.757-.519 1.513-.786 2.292-.648 1.897-1.265 3.803-1.879 5.711-1.512 2.543-1.512 2.543-4.68 3.43-.934.037-1.869.074-2.832.113-2.888-4.34-4.5-8.83-6.187-13.719-.617-1.745-1.233-3.49-1.851-5.235-.48-1.36-.48-1.36-.968-2.748-7.493-21.132-15.167-41.117-30-58.297-.785-.911-1.57-1.823-2.379-2.762-2.167-2.454-4.38-4.853-6.621-7.239-.525-.589-1.05-1.178-1.59-1.785-17.1-18.406-41.271-27.711-64.286-35.875-.68-.248-1.361-.496-2.062-.752-3.408-1.241-6.819-2.474-10.235-3.695-1.258-.453-2.515-.907-3.773-1.36-1.679-.6-1.679-.6-3.391-1.21C71 288 71 288 69 286c-.187-2.375-.187-2.375 1-5 6.85-4.182 15.263-6.3 22.812-8.972 39.813-14.151 73.785-35.85 93.106-75.027 5.396-11.743 9.498-24.088 13.776-36.27.505-1.434.505-1.434 1.019-2.894.639-1.82 1.273-3.641 1.9-5.465.285-.814.57-1.628.863-2.467.378-1.094.378-1.094.763-2.199C205 148 205 148 207 116z"/>
            <path d="M369 32c1.65 0 3.3 0 5 0 .241.67.482 1.339.731 2.029 1.122 3.098 2.258 6.191 3.394 9.283.379 1.053.758 2.105 1.148 3.19 7.313 19.806 18.447 34.976 37.907 44.188 6.3 2.888 12.812 5.172 19.44 7.184C439.711 98.543 439.711 98.543 443 100c.976 2.176.976 2.176 1 4-5.122 2.371-10.282 4.499-15.565 6.48-12.4 4.679-21.887 10.166-31.435 21.52-.628.591-1.256 1.183-1.902 1.793-9.124 9.372-13.724 22.963-17.66 35.176-.262.772-.524 1.545-.79 2.341-.221.689-.442 1.378-.67 2.088-1 1.604-1 1.604-3.103 2.334-.939.133-.939.133-1.897.27-.71-1.687-1.418-3.375-2.125-5.063-.459-1.094-.918-2.188-1.39-3.316-1.254-3.059-2.448-6.133-3.627-9.223-8.078-20.927-20.123-34.186-40.527-43.463-4.998-2.135-10.129-3.947-15.292-5.65-.772-.267-1.545-.535-2.34-.81-.689-.223-1.378-.445-2.09-.687-1.603-1-1.603-1-2.603-4 2.948-2.423 5.656-3.77 9.254-5.016 1.03-.36 2.06-.722 3.124-1.093 1.067-.378 2.135-.755 3.234-1.143 8.531-3.114 16.281-6.047 23.438-12.75.778-.602 1.556-1.204 2.359-1.824C357.736 68.457 363.91 50.308 370 32z"/>
            <path d="M370 338c1.928.127 1.928.127 4 1 1.185 2.142 1.185 2.142 2.148 4.961.366 1.03.732 2.06 1.11 3.121.369 1.087.737 2.174 1.117 3.293 7.014 20.365 17.553 35.917 37 46.125 6.636 3.234 13.472 5.739 20.492 8.016.782.267 1.565.534 2.371.81.702.228 1.404.455 2.127.69C442 407 442 407 442.735 409.105c.088.625.175 1.251.265 1.895-6.147 2.603-12.3 5.125-18.562 7.438-19.377 7.46-33.31 19.545-41.97 38.61-3.25 7.489-5.882 15.213-8.468 22.952-1.65 0-3.3 0-5 0-.211-.604-.422-1.207-.64-1.829-9.045-25.749-18.186-45.286-43.82-57.671-5.315-2.264-10.747-4.206-16.21-6.06-1.184-.413-1.184-.413-2.392-.822-.71-.239-1.419-.478-2.149-.725-1.781-.888-1.781-.888-3.781-3.888 1.416-2.832 3.005-2.91 5.961-3.953 1.03-.373 2.06-.745 3.121-1.129 1.067-.372 2.134-.743 3.232-1.125 20.766-7.52 35.026-19.135 44.488-39.16 2.912-6.448 5.27-13.107 7.613-19.777C366 339 366 339 370 338z"/>
          </svg>
          ${t}
        </span>
        <button type="button" class="rs-ai-mode__close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          ${s}
        </button>
      </div>
      <div class="rs-ai-mode__input-wrapper">
        <textarea class="rs-ai-mode__input"
                  placeholder="${i}"
                  rows="3"></textarea>
        <button type="button" class="rs-ai-mode__search">
          <span class="rs-ai-mode__search-text">${a}</span>
          <span class="rs-ai-mode__loader" style="display:none;">
            <svg class="rs-ai-mode__spinner" width="20" height="20" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-dasharray="31.4 31.4">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
              </circle>
            </svg>
          </span>
        </button>
      </div>
      <div class="rs-ai-mode__examples">
        <span class="rs-ai-mode__examples-label">${r}</span>
        <button type="button" data-query="${l}">${l}</button>
        <button type="button" data-query="${d}">${d}</button>
        <button type="button" data-query="${y}">${y}</button>
      </div>
      <div class="rs-ai-mode__error" style="display: none;"></div>
    `, this.searchContainer && this.searchContainer.appendChild(this.aiModeEl), this.textarea = this.aiModeEl.querySelector(".rs-ai-mode__input"), this.searchBtn = this.aiModeEl.querySelector(".rs-ai-mode__search"), this.errorEl = this.aiModeEl.querySelector(".rs-ai-mode__error"), this.closeBtn = this.aiModeEl.querySelector(".rs-ai-mode__close");
  }
  bindEvents() {
    var t, s, i, r, a;
    (t = this.toggleBtn) == null || t.addEventListener("click", () => this.toggleMode()), (s = this.closeBtn) == null || s.addEventListener("click", () => this.toggleMode()), (i = this.searchBtn) == null || i.addEventListener("click", () => this.search()), (r = this.textarea) == null || r.addEventListener("keydown", (l) => {
      l.key === "Enter" && !l.shiftKey && (l.preventDefault(), this.search());
    });
    const e = (a = this.aiModeEl) == null ? void 0 : a.querySelectorAll(".rs-ai-mode__examples button");
    e == null || e.forEach((l) => {
      l.addEventListener("click", () => {
        const d = l.dataset.query;
        d && this.textarea && (this.textarea.value = d, this.textarea.focus());
      });
    });
  }
  toggleMode() {
    var e, t, s;
    this.isAIMode = !this.isAIMode, this.isAIMode ? (this.searchFormElements.forEach((i) => {
      i.style.display = "none";
    }), this.aiModeEl && (this.aiModeEl.style.display = "block"), (e = this.toggleBtn) == null || e.classList.add("rs-ai-toggle--active"), (t = this.textarea) == null || t.focus(), this.hideError()) : (this.searchFormElements.forEach((i) => {
      i.style.display = "";
    }), this.aiModeEl && (this.aiModeEl.style.display = "none"), (s = this.toggleBtn) == null || s.classList.remove("rs-ai-toggle--active"));
  }
  async search() {
    var t;
    const e = (t = this.textarea) == null ? void 0 : t.value.trim();
    if (!e) {
      this.showError(this.label("ai_search_empty"));
      return;
    }
    this.setLoading(!0), this.hideError();
    try {
      const s = RealtySoftState.get("config.language") || "en_US", i = RealtySoftState.get("data.locations") || [], r = RealtySoftState.get("data.propertyTypes") || [];
      let a = RealtySoftState.get("data.features") || [];
      if (!a || a.length === 0)
        try {
          const p = await RealtySoftAPI.getFeatures();
          p.data && (RealtySoftState.set("data.features", p.data), a = p.data);
        } catch (p) {
          console.warn("[RealtySoft] Could not load features for AI search:", p);
        }
      const l = [];
      a.forEach((p) => {
        p.value_ids && Array.isArray(p.value_ids) && p.value_ids.forEach((S) => {
          l.push({
            id: S.id,
            name: S.name,
            category: p.name
          });
        });
      });
      const y = await (await fetch(`${xe}/ai-search.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: e,
          language: s,
          locations: i,
          propertyTypes: r,
          features: l
        })
      })).json();
      if (y.success && y.filters) {
        const p = this.buildURLParams(y.filters), S = RealtySoftState.get("config.resultsPage") || "/properties/", C = p.toString();
        window.location.href = C ? `${S}?${C}` : S;
      } else
        this.showError(y.error || this.label("ai_search_error"));
    } catch (s) {
      console.error("[RealtySoft] AI search error:", s), this.showError(this.label("ai_search_error"));
    } finally {
      this.setLoading(!1);
    }
  }
  buildURLParams(e) {
    var s;
    const t = new URLSearchParams();
    return e.location != null && t.set("location", String(e.location)), e.sublocation != null && t.set("sublocation", String(e.sublocation)), e.propertyType != null && t.set("type", String(e.propertyType)), e.listingType && t.set("listing", e.listingType), e.bedsMin != null && t.set("beds", String(e.bedsMin)), e.bathsMin != null && t.set("baths", String(e.bathsMin)), e.priceMin != null && t.set("price_min", String(e.priceMin)), e.priceMax != null && t.set("price_max", String(e.priceMax)), e.builtMin != null && t.set("built_min", String(e.builtMin)), e.builtMax != null && t.set("built_max", String(e.builtMax)), e.plotMin != null && t.set("plot_min", String(e.plotMin)), e.plotMax != null && t.set("plot_max", String(e.plotMax)), e.ref && t.set("ref", e.ref), (s = e.features) != null && s.length && t.set("features", e.features.join(",")), t;
  }
  setLoading(e) {
    if (this.isLoading = e, this.searchBtn) {
      this.searchBtn.disabled = e;
      const t = this.searchBtn.querySelector(".rs-ai-mode__search-text"), s = this.searchBtn.querySelector(".rs-ai-mode__loader");
      t && (t.style.display = e ? "none" : "inline"), s && (s.style.display = e ? "inline-flex" : "none");
    }
    this.textarea && (this.textarea.disabled = e);
  }
  showError(e) {
    this.errorEl && (this.errorEl.textContent = e, this.errorEl.style.display = "block");
  }
  hideError() {
    this.errorEl && (this.errorEl.style.display = "none");
  }
}
RealtySoft.registerComponent("rs_ai_search_toggle", Pe);
async function $e() {
  try {
    if (!(await (await fetch(`${xe}/ai-search.php?action=check`)).json()).enabled)
      return;
  } catch {
    return;
  }
  document.querySelectorAll(
    '#rs_search, .rs-search, [class*="rs-template-search"]'
  ).forEach((n) => {
    if (n.querySelector(".rs-ai-toggle"))
      return;
    const e = document.createElement("div");
    e.className = "rs_ai_search_toggle", e.style.display = "none", n.appendChild(e), new Pe(e, {});
  });
}
function Ee() {
  var t, s;
  const _ = window;
  return !((t = _.RealtySoftLabels) != null && t.get) || !((s = _.RealtySoftState) == null ? void 0 : s.get("config.language")) ? !1 : _.RealtySoftLabels.get("search_button") !== "search_button";
}
function Te() {
  var n;
  const _ = window;
  if ((n = _.RealtySoft) != null && n.onReady)
    _.RealtySoft.onReady(() => {
      const e = () => {
        Ee() ? setTimeout($e, 100) : setTimeout(e, 200);
      };
      e();
    });
  else {
    let e = 0;
    const t = 15, s = 300, i = () => {
      e++, document.querySelectorAll(
        '#rs_search, .rs-search, [class*="rs-template-search"]'
      ).length > 0 && Ee() ? $e() : e < t && setTimeout(i, s);
    };
    setTimeout(i, s);
  }
}
document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", Te) : Te();
class pt extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "properties", []);
    o(this, "view", "grid");
    o(this, "loading", !1);
    o(this, "isStandalone", !1);
    o(this, "cardTemplate", null);
    o(this, "imageObserver", null);
    o(this, "prefetchedIds", /* @__PURE__ */ new Set());
    o(this, "container", null);
    o(this, "loader", null);
    o(this, "empty", null);
    this.init();
  }
  init() {
    this.properties = [], this.view = RealtySoftState.get("ui.view") || "grid", this.loading = !1, this.cardTemplate = this.extractCardTemplate(), this.imageObserver = null, this.prefetchedIds = /* @__PURE__ */ new Set();
    const e = this.element.closest('#rs_listing, [class*="rs-listing-template-"]');
    this.isStandalone = !!(e != null && e.hasAttribute("data-rs-standalone")), this.setupImageObserver(), this.render(), this.bindEvents(), this.isStandalone || this.subscribe("results.properties", (t) => {
      this.properties = t || [], this.renderProperties();
    }), this.subscribe("ui.view", (t) => {
      this.view = t, this.updateViewClass();
    }), this.subscribe("ui.loading", (t) => {
      this.loading = t, this.updateLoadingState();
    });
  }
  /**
   * Inject properties directly (used by standalone listings).
   * Bypasses global results state — the grid shows only these properties.
   */
  setStandaloneProperties(e) {
    this.properties = e, this.renderProperties();
  }
  extractCardTemplate() {
    const e = this.element.querySelector(".rs_card");
    if (console.log("[RSPropertyGrid] extractCardTemplate - element:", this.element.className), console.log("[RSPropertyGrid] extractCardTemplate - found .rs_card:", !!e), e) {
      console.log("[RSPropertyGrid] extractCardTemplate - card classes:", e.className);
      const t = e.cloneNode(!0);
      return e.remove(), t;
    }
    return null;
  }
  /**
   * Generate URL for property detail page
   * Stays on client's website with SEO-friendly format
   * Format: /{propertyPageSlug}/{title-slug}-{REFERENCE}
   */
  generatePropertyUrl(e) {
    if (e.url) return e.url;
    const t = RealtySoftState.get("config.propertyPageSlug") || "property", s = e.ref || e.id, r = (e.title || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").substring(0, 80);
    return `/${t}/${r}-${s}`;
  }
  render() {
    var t;
    this.element.classList.add("rs-property-grid", `rs-property-grid--${this.view}`);
    const e = this.element.dataset.rsColumns || ((t = this.element.closest("[data-rs-columns]")) == null ? void 0 : t.getAttribute("data-rs-columns"));
    e && ["1", "2", "3", "4"].includes(e) && this.element.classList.add(`rs-property-grid--cols-${e}`), this.element.innerHTML = `
      <div class="rs-property-grid__container">
        <div class="rs-property-grid__loader" style="display: none;">
          <div class="rs-property-grid__spinner"></div>
          <span>${this.label("results_loading")}</span>
        </div>
        <div class="rs-property-grid__empty" style="display: none;">
          <p>${this.label("results_count_zero")}</p>
        </div>
        <div class="rs-property-grid__items"></div>
      </div>
    `, this.container = this.element.querySelector(".rs-property-grid__items"), this.loader = this.element.querySelector(".rs-property-grid__loader"), this.empty = this.element.querySelector(".rs-property-grid__empty"), this.properties.length > 0 && this.renderProperties();
  }
  bindEvents() {
    if (!this.container) return;
    let e;
    this.container.addEventListener("mouseenter", (t) => {
      const i = t.target.closest(".rs-card");
      if (!i) return;
      const r = i.dataset.propertyId, a = this.properties.find((l) => String(l.id) === r);
      a && (clearTimeout(e), e = setTimeout(() => {
        a.ref ? RealtySoftAPI.prefetchProperty(a.ref, !0) : r && RealtySoftAPI.prefetchProperty(r, !1);
      }, 100));
    }, !0), this.container.addEventListener("mouseleave", (t) => {
      t.target.closest(".rs-card") && clearTimeout(e);
    }, !0), this.container.addEventListener("click", (t) => {
      const s = t.target, i = s.closest(".rs-card");
      if (!i) return;
      const r = i.dataset.propertyId, a = this.properties.find((l) => String(l.id) === r);
      if (s.closest(".rs_card_wishlist")) {
        t.preventDefault(), t.stopPropagation();
        const l = parseInt(i.dataset.totalImages || "0") || 0, d = s.closest(".rs_card_wishlist");
        r && this.toggleWishlist(r, d, l);
        return;
      }
      if (s.closest(".rs_card_link")) {
        if (a) {
          RealtySoftAnalytics.trackCardClick(a);
          const l = t;
          if (typeof RealtySoftRouter < "u" && RealtySoftRouter.isEnabled() && !l.ctrlKey && !l.metaKey && !l.shiftKey) {
            t.preventDefault();
            const d = this.generatePropertyUrl(a);
            RealtySoftRouter.navigateToProperty(a, d);
          }
        }
        return;
      }
      a && RealtySoftAnalytics.trackCardClick(a);
    });
  }
  /**
   * Set up IntersectionObserver for lazy loading images
   * This is more efficient than native loading="lazy" for carousel images
   */
  setupImageObserver() {
    if (!("IntersectionObserver" in window)) {
      console.log("[RSPropertyGrid] IntersectionObserver not supported, using fallback");
      return;
    }
    this.imageObserver && this.imageObserver.disconnect(), this.imageObserver = new IntersectionObserver((e) => {
      e.forEach((t) => {
        var s;
        if (t.isIntersecting) {
          const i = t.target;
          i.dataset.src && (i.src = i.dataset.src, delete i.dataset.src), i.dataset.srcset && (i.srcset = i.dataset.srcset, delete i.dataset.srcset), i.dataset.sizes && (i.sizes = i.dataset.sizes, delete i.dataset.sizes), (s = this.imageObserver) == null || s.unobserve(i);
        }
      });
    }, {
      // Start loading when image is 200px from viewport
      rootMargin: "200px 0px",
      threshold: 0.01
    });
  }
  /**
   * Observe images for lazy loading
   */
  observeImages() {
    if (!this.imageObserver || !this.container) return;
    this.container.querySelectorAll("img[data-src]").forEach((t) => {
      var s;
      (s = this.imageObserver) == null || s.observe(t);
    });
  }
  renderProperties() {
    if (this.container) {
      if (this.container.innerHTML = "", this.properties.length === 0) {
        this.empty && (this.empty.style.display = "block");
        return;
      }
      this.empty && (this.empty.style.display = "none"), this.addLcpPreloadHint(), this.properties.forEach((e) => {
        var s;
        const t = this.createCard(e);
        (s = this.container) == null || s.appendChild(t);
      }), this.observeImages();
    }
  }
  /**
   * Add preload link for LCP (Largest Contentful Paint) image
   * Helps browser prioritize loading the first visible image
   */
  addLcpPreloadHint() {
    var l;
    const e = document.head.querySelector("link[data-rs-lcp-preload]");
    if (e && e.remove(), this.properties.length === 0) return;
    const t = this.properties[0], s = (l = t.images) == null ? void 0 : l[0];
    if (!s) return;
    const i = document.createElement("link");
    i.rel = "preload", i.as = "image", i.href = s, i.fetchPriority = "high", i.dataset.rsLcpPreload = "true";
    const r = t.imagesWithSizes, a = r == null ? void 0 : r[0];
    if (a != null && a.sizes) {
      const d = [];
      a.sizes[256] && d.push(`${a.sizes[256]} 256w`), a.sizes[512] && d.push(`${a.sizes[512]} 512w`), a.sizes[768] && d.push(`${a.sizes[768]} 768w`), d.length > 0 && (i.imageSrcset = d.join(", "), i.imageSizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw");
    }
    document.head.appendChild(i);
  }
  createCard(e) {
    return console.log("[RSPropertyGrid] createCard - has cardTemplate:", !!this.cardTemplate), this.cardTemplate ? (console.log("[RSPropertyGrid] createCard - using CUSTOM card template"), this.createCustomCard(e)) : (console.log("[RSPropertyGrid] createCard - using DEFAULT card"), this.createDefaultCard(e));
  }
  createDefaultCard(e) {
    var f;
    const t = document.createElement("div");
    t.className = "rs-card", t.dataset.propertyId = String(e.id);
    const s = this.generatePropertyUrl(e), i = e.images || [], r = i.slice(0, 5), a = (e.imagesWithSizes || []).slice(0, 5), l = e.total_images || i.length;
    t.dataset.totalImages = String(l);
    const d = r[0] || "/realtysoft/assets/placeholder.jpg", y = RealtySoftLabels.formatPrice(e.price), p = e.ref || e.id, S = typeof WishlistManager < "u" && (WishlistManager == null ? void 0 : WishlistManager.has(p)) || RealtySoftState.isInWishlist(e.id), C = this.buildPropertyTags(e), k = r.length > 0 ? '<div class="rs-card__carousel-placeholder"></div>' : `<img src="${d}" alt="${this.escapeHtml(e.title || "")}" class="rs-card__image" loading="eager" fetchpriority="high">`, L = l > 0 ? `
      <div class="rs-card__image-count">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
        <span>${l}</span>
      </div>
    ` : "";
    if (t.innerHTML = `
      <a href="${s}" class="rs-card__image-link rs_card_link">
        <div class="rs-card__image-wrapper">
          ${k}
          ${C}
          ${L}
        </div>
      </a>
      <button class="rs-card__wishlist rs_card_wishlist ${S ? "rs-card__wishlist--active" : ""}" type="button" aria-label="${this.label("wishlist_add")}">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="${S ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>
      <div class="rs-card__content">
        <a href="${s}" class="rs-card__price-link rs_card_link">
          <div class="rs-card__price rs_card_price">${y}</div>
        </a>
        <a href="${s}" class="rs-card__title-link rs_card_link">
          <h3 class="rs-card__title rs_card_title">${this.escapeHtml(e.title || "")}</h3>
        </a>
        <div class="rs-card__location rs_card_location">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          ${this.escapeHtml(String(e.location || ""))}
        </div>
        <div class="rs-card__specs">
          ${e.beds && e.beds > 0 ? `
            <span class="rs-card__spec rs_card_beds">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 4v16"></path>
                <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                <path d="M2 17h20"></path>
                <path d="M6 8v9"></path>
              </svg>
              ${e.beds} ${e.beds === 1 ? this.label("card_bed") : this.label("card_beds")}
            </span>
          ` : ""}
          ${e.baths && e.baths > 0 ? `
            <span class="rs-card__spec rs_card_baths">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"></path>
                <line x1="10" x2="8" y1="5" y2="7"></line>
                <line x1="2" x2="22" y1="12" y2="12"></line>
                <line x1="7" x2="7" y1="19" y2="21"></line>
                <line x1="17" x2="17" y1="19" y2="21"></line>
              </svg>
              ${e.baths} ${e.baths === 1 ? this.label("card_bath") : this.label("card_baths")}
            </span>
          ` : ""}
          ${e.built_area && e.built_area > 0 ? `
            <span class="rs-card__spec rs_card_built">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              </svg>
              ${e.built_area} ${this.label("card_built")}
            </span>
          ` : ""}
          ${e.plot_size && e.plot_size > 0 ? `
            <span class="rs-card__spec rs_card_plot">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6l9-4 9 4v12l-9 4-9-4V6z"></path>
                <path d="M12 2v20"></path>
                <path d="M3 6l9 4 9-4"></path>
              </svg>
              ${e.plot_size} ${this.label("card_plot")}
            </span>
          ` : ""}
        </div>
        <div class="rs-card__footer">
          <span class="rs-card__ref rs_card_ref">${this.label("card_ref")} ${this.escapeHtml(e.ref || "")}</span>
          <a href="${s}" class="rs-card__link rs_card_link">${this.label("card_view")}</a>
        </div>
      </div>
    `, r.length > 0) {
      const u = t.querySelector(".rs-card__carousel-placeholder");
      if (u) {
        const b = this.createCarousel(r, e.id, l, a);
        (f = u.parentNode) == null || f.replaceChild(b, u);
      }
    }
    return t;
  }
  buildPropertyTags(e) {
    const t = [], s = e.listing_type;
    if (s) {
      const i = {
        resale: "rs-card__tag--sale",
        sale: "rs-card__tag--sale",
        development: "rs-card__tag--development",
        new_development: "rs-card__tag--development",
        long_rental: "rs-card__tag--rental",
        rent: "rs-card__tag--rental",
        short_rental: "rs-card__tag--holiday",
        holiday: "rs-card__tag--holiday"
      }, r = {
        resale: "listing_type_sale",
        sale: "listing_type_sale",
        development: "listing_type_new",
        new_development: "listing_type_new",
        long_rental: "listing_type_long_rental",
        rent: "listing_type_long_rental",
        short_rental: "listing_type_short_rental",
        holiday: "listing_type_short_rental"
      }, a = s.toLowerCase(), l = i[a] || "rs-card__tag--sale", d = r[a], y = d ? this.label(d) : s;
      t.push(`<span class="rs-card__tag ${l}">${y}</span>`);
    }
    return e.is_featured && t.push(`<span class="rs-card__tag rs-card__tag--featured">${this.label("featured")}</span>`), e.is_own && t.push(`<span class="rs-card__tag rs-card__tag--own">${this.label("own")}</span>`), t.length > 0 ? `<div class="rs-card__tags">${t.join("")}</div>` : "";
  }
  createCustomCard(e) {
    if (!this.cardTemplate)
      return this.createDefaultCard(e);
    const t = this.cardTemplate.cloneNode(!0);
    t.classList.add("rs-card"), t.dataset.propertyId = String(e.id);
    const s = this.generatePropertyUrl(e), i = e.images || [], r = i.slice(0, 5), a = (e.imagesWithSizes || []).slice(0, 5), l = e.total_images || i.length;
    t.dataset.totalImages = String(l);
    const d = e.ref || e.id, y = typeof WishlistManager < "u" && (WishlistManager == null ? void 0 : WishlistManager.has(d)) || RealtySoftState.isInWishlist(e.id), p = t.querySelector(".rs_card_carousel");
    if (p && (p.innerHTML = "", r.length > 0)) {
      const K = this.createCarousel(r, e.id, l, a);
      p.appendChild(K);
    }
    const S = t.querySelector(".rs_card_image");
    if (S) {
      const K = r[0] || "/realtysoft/assets/placeholder.jpg";
      S.tagName === "IMG" ? (S.src = K, S.alt = this.escapeHtml(e.title || ""), S.loading = "eager", S.fetchPriority = "high") : S.innerHTML = `<img src="${K}" alt="${this.escapeHtml(e.title || "")}" loading="eager" fetchpriority="high">`;
    }
    const C = t.querySelector(".rs_card_status");
    if (C) {
      const K = e.listing_type;
      if (K) {
        const ie = {
          resale: "rs-card__tag--sale",
          sale: "rs-card__tag--sale",
          development: "rs-card__tag--development",
          new_development: "rs-card__tag--development",
          long_rental: "rs-card__tag--rental",
          rent: "rs-card__tag--rental",
          short_rental: "rs-card__tag--holiday",
          holiday: "rs-card__tag--holiday"
        }, X = {
          resale: "listing_type_sale",
          sale: "listing_type_sale",
          development: "listing_type_new",
          new_development: "listing_type_new",
          long_rental: "listing_type_long_rental",
          rent: "listing_type_long_rental",
          short_rental: "listing_type_short_rental",
          holiday: "listing_type_short_rental"
        }, ce = K.toLowerCase(), c = ie[ce] || "rs-card__tag--sale", x = X[ce], $ = x ? this.label(x) : K;
        C.innerHTML = `<span class="rs-card__tag ${c}">${$}</span>`, e.is_featured && (C.innerHTML += `<span class="rs-card__tag rs-card__tag--featured">${this.label("featured")}</span>`), e.is_own && (C.innerHTML += `<span class="rs-card__tag rs-card__tag--own">${this.label("own")}</span>`);
      }
    }
    const k = t.querySelector(".rs_card_wishlist");
    k && (k.classList.add("rs-card__wishlist"), k.classList.toggle("rs-card__wishlist--active", y), k.type = "button", k.setAttribute("aria-label", this.label("wishlist_add")), k.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="${y ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      `);
    const L = t.querySelector(".rs_card_price");
    L && (L.textContent = RealtySoftLabels.formatPrice(e.price));
    const f = t.querySelector(".rs_card_title");
    f && (f.textContent = e.title || "");
    const u = t.querySelector(".rs_card_location");
    u && (u.textContent = String(e.location || ""));
    const b = t.querySelector(".rs_card_beds");
    b && (e.beds && e.beds > 0 ? b.textContent = `${e.beds} ${e.beds === 1 ? this.label("card_bed") : this.label("card_beds")}` : b.style.display = "none");
    const M = t.querySelector(".rs_card_baths");
    M && (e.baths && e.baths > 0 ? M.textContent = `${e.baths} ${e.baths === 1 ? this.label("card_bath") : this.label("card_baths")}` : M.style.display = "none");
    const z = t.querySelector(".rs_card_built");
    z && (e.built_area && e.built_area > 0 ? z.textContent = `${e.built_area} ${this.label("card_built")}` : z.style.display = "none");
    const W = t.querySelector(".rs_card_plot");
    W && (e.plot_size && e.plot_size > 0 ? W.textContent = `${e.plot_size} ${this.label("card_plot")}` : W.style.display = "none");
    const G = t.querySelector(".rs_card_description");
    G && (G.textContent = e.short_description || e.description || "");
    const U = t.querySelector(".rs_card_ref");
    U && (U.textContent = e.ref || "");
    const te = t.querySelector(".rs_card_type");
    te && (te.textContent = e.type || ""), t.querySelectorAll(".rs_card_link").forEach((K) => {
      K.tagName === "A" && (K.href = s);
    });
    const N = t.querySelector(".rs_card_image_count");
    return N && (N.textContent = String(l)), t;
  }
  createCarousel(e, t, s, i = []) {
    var C, k;
    if (!e || e.length === 0) {
      const L = document.createElement("div");
      return L.className = "rs-card__carousel", L;
    }
    const r = (L) => {
      if (!L || !L.sizes) return "";
      const f = [];
      return L.sizes[256] && f.push(`${L.sizes[256]} 256w`), L.sizes[512] && f.push(`${L.sizes[512]} 512w`), L.sizes[768] && f.push(`${L.sizes[768]} 768w`), f.length > 0 ? f.join(", ") : "";
    }, a = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw", l = document.createElement("div");
    l.className = "rs-card__carousel", l.innerHTML = `
      <div class="rs-card__carousel-track">
        ${e.map((L, f) => {
      const u = i[f], b = r(u), M = b ? `srcset="${b}" sizes="${a}"` : "";
      if (f === 0)
        return `<div class="rs-card__carousel-slide rs-card__carousel-slide--active">
              <img src="${L}" ${M} loading="eager" fetchpriority="high" alt="">
            </div>`;
      {
        const z = b ? `data-srcset="${b}" data-sizes="${a}"` : "";
        return `<div class="rs-card__carousel-slide">
              <img data-src="${L}" ${z} loading="lazy" alt="">
            </div>`;
      }
    }).join("")}
      </div>
      ${e.length > 1 ? `
        <button class="rs-card__carousel-prev" type="button" aria-label="Previous">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <button class="rs-card__carousel-next" type="button" aria-label="Next">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
        <div class="rs-card__carousel-dots">
          ${e.map((L, f) => `
            <span class="rs-card__carousel-dot ${f === 0 ? "rs-card__carousel-dot--active" : ""}" data-index="${f}"></span>
          `).join("")}
        </div>
      ` : ""}
    `;
    let d = 0;
    const y = l.querySelectorAll(".rs-card__carousel-slide"), p = l.querySelectorAll(".rs-card__carousel-dot"), S = (L) => {
      L < 0 && (L = e.length - 1), L >= e.length && (L = 0), y.forEach((b, M) => b.classList.toggle("rs-card__carousel-slide--active", M === L)), p.forEach((b, M) => b.classList.toggle("rs-card__carousel-dot--active", M === L)), d = L;
      const u = y[L].querySelector("img");
      u && u.dataset.src && !u.src && (u.src = u.dataset.src, u.dataset.srcset && (u.srcset = u.dataset.srcset, u.sizes = u.dataset.sizes || ""));
    };
    return (C = l.querySelector(".rs-card__carousel-prev")) == null || C.addEventListener("click", (L) => {
      L.preventDefault(), L.stopPropagation(), S(d - 1);
    }), (k = l.querySelector(".rs-card__carousel-next")) == null || k.addEventListener("click", (L) => {
      L.preventDefault(), L.stopPropagation(), S(d + 1);
    }), p.forEach((L) => {
      L.addEventListener("click", (f) => {
        f.preventDefault(), f.stopPropagation(), S(parseInt(L.dataset.index || "0"));
      });
    }), l;
  }
  toggleWishlist(e, t, s = 0) {
    try {
      const i = this.properties.find((l) => String(l.id) === e);
      if (!i) {
        console.warn("[PropertyGrid] Property not found for wishlist toggle:", e);
        return;
      }
      const r = i.ref || i.id, a = typeof WishlistManager < "u" && WishlistManager;
      if (a && WishlistManager.has(r)) {
        WishlistManager.remove(r), t.classList.remove("rs-card__wishlist--active");
        const l = t.querySelector("svg");
        l && l.setAttribute("fill", "none");
        try {
          RealtySoftAnalytics.trackWishlistRemove(i.id);
        } catch {
        }
        typeof RealtySoftToast < "u" && RealtySoftToast && RealtySoftToast.success(this.label("wishlist_removed") || "Removed from wishlist");
      } else {
        let l = !1;
        if (a && (l = WishlistManager.add({
          id: i.id,
          ref_no: r,
          title: i.title,
          price: i.price,
          location: i.location,
          type: i.type,
          beds: i.beds,
          baths: i.baths,
          built: i.built_area,
          plot: i.plot_size,
          images: i.images || [],
          total_images: s || i.total_images || (i.images || []).length,
          listing_type: i.listing_type,
          is_featured: i.is_featured || !1
        })), l) {
          t.classList.add("rs-card__wishlist--active");
          const d = t.querySelector("svg");
          d && d.setAttribute("fill", "currentColor");
          try {
            RealtySoftAnalytics.trackWishlistAdd(i.id);
          } catch {
          }
          typeof RealtySoftToast < "u" && RealtySoftToast && RealtySoftToast.success(this.label("wishlist_add") || "Added to wishlist");
        } else {
          console.error("[PropertyGrid] Failed to add to wishlist. WishlistManager available:", !!a), typeof RealtySoftToast < "u" && RealtySoftToast && RealtySoftToast.error(this.label("wishlist_error") || "Could not add to wishlist.");
          return;
        }
      }
      try {
        const l = i.id;
        RealtySoftState.isInWishlist(l) ? RealtySoftState.removeFromWishlist(l) : RealtySoftState.addToWishlist(l);
      } catch (l) {
        console.warn("[PropertyGrid] State sync error (non-critical):", l);
      }
    } catch (i) {
      console.error("[PropertyGrid] Wishlist toggle error:", i);
    }
  }
  updateViewClass() {
    this.element.classList.remove("rs-property-grid--grid", "rs-property-grid--list"), this.element.classList.add(`rs-property-grid--${this.view}`);
  }
  updateLoadingState() {
    this.loading ? this.properties.length === 0 && this.container ? (this.loader && (this.loader.style.display = "none"), this.container.innerHTML = this.createSkeletonCards(6)) : (this.loader && (this.loader.style.display = "flex"), this.container && (this.container.style.opacity = "0.5")) : (this.loader && (this.loader.style.display = "none"), this.container && (this.container.style.opacity = "1"));
  }
  /**
   * Create skeleton card placeholders for loading state
   */
  createSkeletonCards(e = 6) {
    return `
      <style>
        .rs-card--skeleton {
          background: #fff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .rs-card--skeleton .rs-skeleton__pulse {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: rs-skeleton-pulse 1.5s infinite;
        }
        @keyframes rs-skeleton-pulse {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .rs-card--skeleton .rs-skeleton__image {
          height: 200px;
          background: #e0e0e0;
        }
        .rs-card--skeleton .rs-skeleton__content {
          padding: 15px;
        }
        .rs-card--skeleton .rs-skeleton__price {
          height: 24px;
          width: 40%;
          margin-bottom: 10px;
          border-radius: 4px;
        }
        .rs-card--skeleton .rs-skeleton__title {
          height: 18px;
          width: 80%;
          margin-bottom: 8px;
          border-radius: 4px;
        }
        .rs-card--skeleton .rs-skeleton__location {
          height: 14px;
          width: 60%;
          margin-bottom: 12px;
          border-radius: 4px;
        }
        .rs-card--skeleton .rs-skeleton__specs {
          display: flex;
          gap: 15px;
        }
        .rs-card--skeleton .rs-skeleton__spec {
          height: 14px;
          width: 50px;
          border-radius: 4px;
        }
      </style>
    ` + Array(e).fill(`
      <div class="rs-card rs-card--skeleton">
        <div class="rs-skeleton__image rs-skeleton__pulse"></div>
        <div class="rs-skeleton__content">
          <div class="rs-skeleton__price rs-skeleton__pulse"></div>
          <div class="rs-skeleton__title rs-skeleton__pulse"></div>
          <div class="rs-skeleton__location rs-skeleton__pulse"></div>
          <div class="rs-skeleton__specs">
            <div class="rs-skeleton__spec rs-skeleton__pulse"></div>
            <div class="rs-skeleton__spec rs-skeleton__pulse"></div>
            <div class="rs-skeleton__spec rs-skeleton__pulse"></div>
          </div>
        </div>
      </div>
    `).join("");
  }
  escapeHtml(e) {
    if (!e) return "";
    const t = document.createElement("div");
    return t.textContent = e, t.innerHTML;
  }
}
RealtySoft.registerComponent("rs_property_grid", pt);
class ut extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "properties", []);
    o(this, "active", 0);
    o(this, "isAnimating", !1);
    o(this, "v2Initialized", !1);
    o(this, "v3Initialized", !1);
    o(this, "autoPlayTimer", null);
    o(this, "touchStartX", 0);
    o(this, "touchEndX", 0);
    o(this, "autoPlay", !1);
    o(this, "autoPlayInterval", 5e3);
    o(this, "limit", 10);
    o(this, "featured", !1);
    o(this, "own", !1);
    o(this, "location", null);
    o(this, "listingType", null);
    o(this, "propertyType", null);
    o(this, "minPrice", null);
    o(this, "maxPrice", null);
    o(this, "minBeds", null);
    o(this, "track", null);
    o(this, "itemsContainer", null);
    o(this, "dotsContainer", null);
    o(this, "loader", null);
    o(this, "emptyState", null);
    o(this, "leftArrow", null);
    o(this, "rightArrow", null);
    this.init();
  }
  init() {
    console.log("[RSPropertyCarousel] Initializing..."), this.properties = this.options.properties || [], this.active = 0, this.isAnimating = !1, this.v2Initialized = !1, this.v3Initialized = !1, this.variation = this.options.variation || this.element.dataset.rsVariation || "1", this.autoPlayTimer = null, this.touchStartX = 0, this.touchEndX = 0, this.autoPlay = this.element.dataset.rsAutoplay === "true", this.autoPlayInterval = parseInt(this.element.dataset.rsInterval || "5000") || 5e3, this.limit = parseInt(this.element.dataset.rsLimit || "10") || 10, this.featured = this.element.dataset.rsFeatured === "true", this.own = this.element.dataset.rsOwn === "true", this.location = this.element.dataset.rsLocation || null, this.listingType = this.element.dataset.rsListingType || null, this.propertyType = this.element.dataset.rsPropertyType || null, this.minPrice = this.element.dataset.rsMinPrice || null, this.maxPrice = this.element.dataset.rsMaxPrice || null, this.minBeds = this.element.dataset.rsMinBeds || null, console.log("[RSPropertyCarousel] Config:", {
      autoPlay: this.autoPlay,
      interval: this.autoPlayInterval,
      limit: this.limit,
      featured: this.featured,
      own: this.own,
      location: this.location,
      listingType: this.listingType,
      variation: this.variation
    }), this.render(), this.bindEvents(), this.properties.length === 0 ? this.loadProperties() : (this.renderItems(), this.startAutoPlay());
  }
  /**
   * Generate URL for property detail page
   */
  generatePropertyUrl(e) {
    if (e.url) return e.url;
    const t = typeof RealtySoftState < "u" && RealtySoftState.get("config.propertyPageSlug") || "property", s = e.ref || e.id, r = (e.title || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").substring(0, 80);
    return `/${t}/${r}-${s}`;
  }
  render() {
    this.element.classList.add("rs-property-carousel", `rs-property-carousel--v${this.variation}`);
    const e = this.label("carousel_prev") || "Previous", t = this.label("carousel_next") || "Next";
    this.variation === "4" ? this.element.innerHTML = `
        <button class="rs-property-carousel__arrow rs-property-carousel__arrow--left" type="button" aria-label="${e}">
          <span class="rs-property-carousel__arrow-label">Prev</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>

        <div class="rs-property-carousel__track">
          <div class="rs-property-carousel__loader">
            <div class="rs-property-carousel__spinner"></div>
            <span class="rs-property-carousel__loader-text">Loading properties...</span>
          </div>
          <div class="rs-property-carousel__empty" style="display: none;">
            <p>No properties found</p>
          </div>
          <div class="rs-property-carousel__items"></div>
        </div>

        <button class="rs-property-carousel__arrow rs-property-carousel__arrow--right" type="button" aria-label="${t}">
          <span class="rs-property-carousel__arrow-label">Next</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      ` : this.element.innerHTML = `
        <button class="rs-property-carousel__arrow rs-property-carousel__arrow--left" type="button" aria-label="${e}">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <div class="rs-property-carousel__track">
          <div class="rs-property-carousel__loader">
            <div class="rs-property-carousel__spinner"></div>
            <span class="rs-property-carousel__loader-text">Loading properties...</span>
          </div>
          <div class="rs-property-carousel__empty" style="display: none;">
            <p>No properties found</p>
          </div>
          <div class="rs-property-carousel__items"></div>
        </div>

        <button class="rs-property-carousel__arrow rs-property-carousel__arrow--right" type="button" aria-label="${t}">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>

        <div class="rs-property-carousel__dots"></div>
      `, this.track = this.element.querySelector(".rs-property-carousel__track"), this.itemsContainer = this.element.querySelector(".rs-property-carousel__items"), this.dotsContainer = this.element.querySelector(".rs-property-carousel__dots"), this.loader = this.element.querySelector(".rs-property-carousel__loader"), this.emptyState = this.element.querySelector(".rs-property-carousel__empty"), this.leftArrow = this.element.querySelector(".rs-property-carousel__arrow--left"), this.rightArrow = this.element.querySelector(".rs-property-carousel__arrow--right");
  }
  bindEvents() {
    var t, s, i, r, a;
    (t = this.leftArrow) == null || t.addEventListener("click", () => this.moveLeft()), (s = this.rightArrow) == null || s.addEventListener("click", () => this.moveRight()), this.element.addEventListener("keydown", (l) => {
      l.key === "ArrowLeft" ? (l.preventDefault(), this.moveLeft()) : l.key === "ArrowRight" && (l.preventDefault(), this.moveRight());
    }), (i = this.track) == null || i.addEventListener("touchstart", (l) => {
      this.touchStartX = l.changedTouches[0].screenX, this.stopAutoPlay();
    }, { passive: !0 }), (r = this.track) == null || r.addEventListener("touchend", (l) => {
      this.touchEndX = l.changedTouches[0].screenX, this.handleSwipe(), this.startAutoPlay();
    }, { passive: !0 }), this.element.addEventListener("mouseenter", () => this.stopAutoPlay()), this.element.addEventListener("mouseleave", () => this.startAutoPlay());
    let e;
    window.addEventListener("resize", () => {
      clearTimeout(e), e = setTimeout(() => {
        this.properties.length > 0 && this.renderItems();
      }, 250);
    }), this.dotsContainer && this.dotsContainer.addEventListener("click", (l) => {
      const y = l.target.closest(".rs-property-carousel__dot");
      if (y) {
        const p = parseInt(y.dataset.index || "0");
        this.goToSlide(p);
      }
    }), (a = this.itemsContainer) == null || a.addEventListener("click", (l) => {
      const y = l.target.closest(".rs-property-carousel__item");
      if (!y) return;
      const p = this.getItemLevel(y);
      p === -2 || p === -1 ? (l.preventDefault(), this.moveLeft()) : (p === 1 || p === 2) && (l.preventDefault(), this.moveRight());
    }), this.element.addEventListener("click", (l) => {
      const y = l.target.closest("[data-rs-property-url]");
      if (!y) return;
      const p = y.dataset.rsPropertyUrl;
      if (!p) return;
      const S = l;
      if (typeof window.RealtySoftRouter < "u" && window.RealtySoftRouter.isEnabled() && !S.ctrlKey && !S.metaKey && !S.shiftKey) {
        const C = this.properties.find((k) => this.generatePropertyUrl(k) === p);
        if (C) {
          l.preventDefault(), window.RealtySoftRouter.navigateToProperty(C, p);
          return;
        }
      }
      window.location.href = p;
    });
  }
  getItemLevel(e) {
    return e.classList.contains("rs-property-carousel__item--level-2") ? -2 : e.classList.contains("rs-property-carousel__item--level-1") ? -1 : e.classList.contains("rs-property-carousel__item--level0") ? 0 : e.classList.contains("rs-property-carousel__item--level1") ? 1 : e.classList.contains("rs-property-carousel__item--level2") ? 2 : null;
  }
  handleSwipe() {
    const t = this.touchStartX - this.touchEndX;
    Math.abs(t) > 50 && (t > 0 ? this.moveRight() : this.moveLeft());
  }
  async loadProperties() {
    console.log("[RSPropertyCarousel] Loading properties..."), this.showLoader();
    try {
      if (typeof RealtySoftAPI > "u")
        throw new Error("RealtySoftAPI is not available");
      const e = {
        per_page: this.limit,
        page: 1
      };
      this.featured && (e.is_featured = 1), this.own && (e.is_own = 1), this.location && (e.location_id = this.location), this.listingType && (e.listing_type = this.listingType), this.propertyType && (e.type_id = this.propertyType), this.minPrice && (e.price_min = this.minPrice), this.maxPrice && (e.price_max = this.maxPrice), this.minBeds && (e.bedrooms_min = this.minBeds), console.log("[RSPropertyCarousel] API params:", e);
      const t = await RealtySoftAPI.searchProperties(e);
      console.log("[RSPropertyCarousel] API result:", t), t && t.data && t.data.length > 0 ? (this.properties = t.data, console.log("[RSPropertyCarousel] Loaded", this.properties.length, "properties"), (this.variation === "2" || this.variation === "3") && this.properties.length > 4 && (this.active = 2), this.hideLoader(), this.renderItems(), this.startAutoPlay()) : (console.log("[RSPropertyCarousel] No properties returned"), this.showEmptyState());
    } catch (e) {
      console.error("[RSPropertyCarousel] Failed to load properties:", e), this.showEmptyState("Failed to load properties");
    }
  }
  showLoader() {
    this.loader && (this.loader.style.display = "flex"), this.emptyState && (this.emptyState.style.display = "none"), this.itemsContainer && (this.itemsContainer.style.opacity = "0");
  }
  hideLoader() {
    this.loader && (this.loader.style.display = "none"), this.itemsContainer && (this.itemsContainer.style.opacity = "1");
  }
  showEmptyState(e) {
    if (this.loader && (this.loader.style.display = "none"), this.emptyState && (this.emptyState.style.display = "flex", e)) {
      const t = this.emptyState.querySelector("p");
      t && (t.textContent = e);
    }
    this.leftArrow && (this.leftArrow.style.display = "none"), this.rightArrow && (this.rightArrow.style.display = "none");
  }
  /**
   * Generate 5 visible items based on active index
   */
  generateVisibleItems() {
    const e = [], t = this.properties.length;
    if (t === 0) return e;
    if (t < 5) {
      for (let s = 0; s < t; s++) {
        const i = s - Math.floor(t / 2);
        e.push({
          property: this.properties[s],
          level: i,
          index: s
        });
      }
      return e;
    }
    for (let s = -2; s <= 2; s++) {
      let i = this.active + s;
      i < 0 ? i = t + i : i >= t && (i = i % t), e.push({
        property: this.properties[i],
        level: s,
        index: i
      });
    }
    return e;
  }
  renderItems() {
    if (this.variation === "2") {
      this.renderItemsV2();
      return;
    }
    if (this.variation === "3") {
      this.renderItemsV3();
      return;
    }
    if (this.variation === "4") {
      this.renderItemsV4();
      return;
    }
    if (this.variation === "5") {
      this.renderItemsV5();
      return;
    }
    if (this.variation === "6") {
      this.renderItemsV6();
      return;
    }
    if (console.log("[RSPropertyCarousel] Rendering V1 with", this.properties.length, "items, active:", this.active), this.properties.length === 0) {
      this.showEmptyState();
      return;
    }
    const e = this.generateVisibleItems();
    this.itemsContainer && (this.itemsContainer.innerHTML = ""), e.forEach(({ property: t, level: s, index: i }) => {
      var a;
      const r = this.createCarouselItem(t, s, i);
      (a = this.itemsContainer) == null || a.appendChild(r);
    }), this.renderDots(), this.leftArrow && (this.leftArrow.style.display = "flex"), this.rightArrow && (this.rightArrow.style.display = "flex");
  }
  /**
   * Render items for Template 2 (3D Perspective)
   * Applies 3D transforms directly via inline styles
   */
  renderItemsV2() {
    var i;
    if (console.log("[RSPropertyCarousel] Rendering V2 with", this.properties.length, "items, active:", this.active), this.properties.length === 0) {
      this.showEmptyState();
      return;
    }
    !this.v2Initialized && this.itemsContainer && (this.itemsContainer.innerHTML = "", this.properties.forEach((r, a) => {
      var d;
      const l = this.createCarouselItemV2(r, a);
      (d = this.itemsContainer) == null || d.appendChild(l);
    }), this.v2Initialized = !0);
    const t = ((i = this.itemsContainer) == null ? void 0 : i.querySelectorAll(".rs-property-carousel__item")) || [], s = this.properties.length;
    t.forEach((r, a) => {
      let l = this.active - a;
      l > s / 2 ? l -= s : l < -s / 2 && (l += s);
      const d = Math.abs(l), y = l === 0, p = d < 3;
      this.updateCarouselItemV2Transform(r, {
        offsetFromActive: l,
        absOffsetFromActive: d,
        isActive: y,
        isVisible: p
      });
    }), this.renderDots(), this.leftArrow && (this.leftArrow.style.display = "flex"), this.rightArrow && (this.rightArrow.style.display = "flex");
  }
  createCarouselItemV2(e, t) {
    var S;
    const s = document.createElement("div");
    s.className = "rs-property-carousel__item", s.dataset.index = String(t);
    const i = this.generatePropertyUrl(e), r = ((S = e.images) == null ? void 0 : S[0]) || "/realtysoft/assets/placeholder.jpg";
    let a = "";
    typeof RealtySoftLabels < "u" && RealtySoftLabels.formatPrice ? a = RealtySoftLabels.formatPrice(e.price) : a = e.price ? `€${e.price.toLocaleString()}` : "";
    const l = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M2 4v16"></path>
      <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
      <path d="M2 17h20"></path>
      <path d="M6 8v9"></path>
    </svg>`, d = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"></path>
      <line x1="10" x2="8" y1="5" y2="7"></line>
      <line x1="2" x2="22" y1="12" y2="12"></line>
      <line x1="7" x2="7" y1="19" y2="21"></line>
      <line x1="17" x2="17" y1="19" y2="21"></line>
    </svg>`;
    let y = "";
    e.beds && e.beds > 0 && (y += `<span class="rs-property-carousel__card-spec">${l} ${e.beds}</span>`), e.baths && e.baths > 0 && (y += `<span class="rs-property-carousel__card-spec">${d} ${e.baths}</span>`);
    const p = this.label("card_view") || "View Details";
    return s.innerHTML = `
      <a href="${i}" class="rs-property-carousel__card">
        <img src="${r}" alt="${this.escapeHtml(e.title || "")}" class="rs-property-carousel__card-image" loading="lazy">
        <div class="rs-property-carousel__card-overlay">
          <h3 class="rs-property-carousel__card-title">${this.escapeHtml(e.title || "")}</h3>
          ${y ? `<div class="rs-property-carousel__card-specs">${y}</div>` : ""}
          <p class="rs-property-carousel__card-price">${a}</p>
          <span class="rs-property-carousel__card-link">${p} &rarr;</span>
        </div>
      </a>
    `, s;
  }
  updateCarouselItemV2Transform(e, { offsetFromActive: t, absOffsetFromActive: s, isActive: i, isVisible: r }) {
    const a = window.innerWidth;
    let l = 120, d = -100, y = -15, p = 4;
    a <= 400 ? (l = 70, d = -60, y = -10, p = 3) : a <= 600 ? (l = 90, d = -80, y = -12, p = 3) : a <= 900 && (l = 100, d = -90, y = -12);
    const S = t * y, C = i ? 1 : Math.max(0.7, 1 - s * 0.15), k = s * d, L = t * l, f = i ? 0 : Math.min(s * p, 10);
    e.style.transform = `translateX(${L}px) translateZ(${k}px) rotateY(${S}deg) scale(${C})`, e.style.filter = f > 0 ? `blur(${f}px)` : "none", e.style.pointerEvents = i ? "auto" : "none", e.style.zIndex = String(10 - s), e.style.opacity = r ? i ? "1" : "0.95" : "0";
    const u = e.querySelector(".rs-property-carousel__card-overlay");
    u && (u.style.opacity = i ? "1" : "0");
  }
  /**
   * Render items for Template 3 (Coverflow)
   * Cards rotate to face center, with faded/greyscale effect on sides
   */
  renderItemsV3() {
    var i;
    if (console.log("[RSPropertyCarousel] Rendering V3 with", this.properties.length, "items, active:", this.active), this.properties.length === 0) {
      this.showEmptyState();
      return;
    }
    !this.v3Initialized && this.itemsContainer && (this.itemsContainer.innerHTML = "", this.properties.forEach((r, a) => {
      var d;
      const l = this.createCarouselItemV3(r, a);
      (d = this.itemsContainer) == null || d.appendChild(l);
    }), this.v3Initialized = !0);
    const t = ((i = this.itemsContainer) == null ? void 0 : i.querySelectorAll(".rs-property-carousel__item")) || [], s = this.properties.length;
    t.forEach((r, a) => {
      let l = this.active - a;
      l > s / 2 ? l -= s : l < -s / 2 && (l += s);
      const d = Math.abs(l), y = l === 0, p = d < 3;
      this.updateCarouselItemV3Transform(r, {
        offsetFromActive: l,
        absOffsetFromActive: d,
        isActive: y,
        isVisible: p
      });
    }), this.renderDots(), this.leftArrow && (this.leftArrow.style.display = "flex"), this.rightArrow && (this.rightArrow.style.display = "flex");
  }
  createCarouselItemV3(e, t) {
    var S;
    const s = document.createElement("div");
    s.className = "rs-property-carousel__item", s.dataset.index = String(t);
    const i = this.generatePropertyUrl(e), r = ((S = e.images) == null ? void 0 : S[0]) || "/realtysoft/assets/placeholder.jpg";
    let a = "";
    typeof RealtySoftLabels < "u" && RealtySoftLabels.formatPrice ? a = RealtySoftLabels.formatPrice(e.price) : a = e.price ? `€${e.price.toLocaleString()}` : "";
    const l = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M2 4v16"></path>
      <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
      <path d="M2 17h20"></path>
      <path d="M6 8v9"></path>
    </svg>`, d = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"></path>
      <line x1="10" x2="8" y1="5" y2="7"></line>
      <line x1="2" x2="22" y1="12" y2="12"></line>
      <line x1="7" x2="7" y1="19" y2="21"></line>
      <line x1="17" x2="17" y1="19" y2="21"></line>
    </svg>`;
    let y = "";
    e.beds && e.beds > 0 && (y += `<span class="rs-property-carousel__card-spec">${l} ${e.beds}</span>`), e.baths && e.baths > 0 && (y += `<span class="rs-property-carousel__card-spec">${d} ${e.baths}</span>`);
    const p = this.label("card_view") || "View Details";
    return s.innerHTML = `
      <a href="${i}" class="rs-property-carousel__card">
        <img src="${r}" alt="${this.escapeHtml(e.title || "")}" class="rs-property-carousel__card-image" loading="lazy">
        <div class="rs-property-carousel__card-overlay">
          <h3 class="rs-property-carousel__card-title">${this.escapeHtml(e.title || "")}</h3>
          ${y ? `<div class="rs-property-carousel__card-specs">${y}</div>` : ""}
          <p class="rs-property-carousel__card-price">${a}</p>
          <span class="rs-property-carousel__card-link">${p} &rarr;</span>
        </div>
      </a>
    `, s;
  }
  updateCarouselItemV3Transform(e, { offsetFromActive: t, absOffsetFromActive: s, isActive: i, isVisible: r }) {
    const a = window.innerWidth;
    let l = 240, d = 45, y = 0.85, p = 100;
    a <= 400 ? (l = 120, d = 40, y = 0.8, p = 60) : a <= 600 ? (l = 160, d = 42, y = 0.82, p = 80) : a <= 900 && (l = 200, d = 44, y = 0.83, p = 90);
    const S = i ? 0 : t > 0 ? d : -d, C = i ? 1 : Math.max(0.7, y - s * 0.05), k = -t * l, L = i ? 100 : -p * s, f = i ? 100 : Math.max(20, 100 - s * 35), u = i ? 100 : Math.max(70, 100 - s * 12), M = a <= 600 ? i : r;
    e.style.transform = `translateX(${k}px) translateZ(${L}px) rotateY(${S}deg) scale(${C})`, e.style.filter = i ? "none" : `saturate(${f}%) brightness(${u}%)`, e.style.pointerEvents = i ? "auto" : "none", e.style.zIndex = String(10 - s), e.style.opacity = M ? "1" : "0";
    const z = e.querySelector(".rs-property-carousel__card-overlay");
    z && (z.style.opacity = i ? "1" : "0");
  }
  /**
   * Render items for Template 4 (Fullwidth Image with Side Navigation)
   */
  renderItemsV4() {
    var s;
    if (console.log("[RSPropertyCarousel] Rendering V4 with", this.properties.length, "items, active:", this.active), this.properties.length === 0) {
      this.showEmptyState();
      return;
    }
    const e = this.properties[this.active];
    this.itemsContainer && (this.itemsContainer.innerHTML = "");
    const t = this.createCarouselItemV4(e, this.active);
    (s = this.itemsContainer) == null || s.appendChild(t), this.updatePageCounter(), this.leftArrow && (this.leftArrow.style.display = "flex"), this.rightArrow && (this.rightArrow.style.display = "flex");
  }
  createCarouselItemV4(e, t) {
    var S;
    const s = document.createElement("div");
    s.className = "rs-property-carousel__item", s.dataset.index = String(t);
    const i = this.generatePropertyUrl(e), r = ((S = e.images) == null ? void 0 : S[0]) || "/realtysoft/assets/placeholder.jpg";
    let a = "";
    typeof RealtySoftLabels < "u" && RealtySoftLabels.formatPrice ? a = RealtySoftLabels.formatPrice(e.price) : a = e.price ? `€${e.price.toLocaleString()}` : "";
    const l = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M2 4v16"></path>
      <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
      <path d="M2 17h20"></path>
      <path d="M6 8v9"></path>
    </svg>`, d = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"></path>
      <line x1="10" x2="8" y1="5" y2="7"></line>
      <line x1="2" x2="22" y1="12" y2="12"></line>
      <line x1="7" x2="7" y1="19" y2="21"></line>
      <line x1="17" x2="17" y1="19" y2="21"></line>
    </svg>`;
    let y = "";
    e.beds && e.beds > 0 && (y += `<span class="rs-property-carousel__card-spec">${l} ${e.beds}</span>`), e.baths && e.baths > 0 && (y += `<span class="rs-property-carousel__card-spec">${d} ${e.baths}</span>`);
    const p = this.label("card_view") || "View Details";
    return s.innerHTML = `
      <a href="${i}" class="rs-property-carousel__card">
        <img src="${r}" alt="${this.escapeHtml(e.title || "")}" class="rs-property-carousel__card-image" loading="lazy">
        <div class="rs-property-carousel__card-overlay">
          <h3 class="rs-property-carousel__card-title">${this.escapeHtml(e.title || "")}</h3>
          ${y ? `<div class="rs-property-carousel__card-specs">${y}</div>` : ""}
          <p class="rs-property-carousel__card-price">${a}</p>
          <span class="rs-property-carousel__card-link">${p} &rarr;</span>
        </div>
      </a>
    `, s;
  }
  updatePageCounter() {
    if (this.variation !== "4") return;
    let e = this.element.querySelector(".rs-property-carousel__counter");
    e || (e = document.createElement("div"), e.className = "rs-property-carousel__counter", this.element.appendChild(e)), e.innerHTML = `<span class="rs-property-carousel__counter-current">${this.active + 1}</span>/<span class="rs-property-carousel__counter-total">${this.properties.length}</span>`;
  }
  /**
   * Render items for Template 5 (Tilted/Skewed Images)
   */
  renderItemsV5() {
    var t;
    if (console.log("[RSPropertyCarousel] Rendering V5 with", this.properties.length, "items, active:", this.active), this.properties.length === 0) {
      this.showEmptyState();
      return;
    }
    this.itemsContainer && (this.itemsContainer.innerHTML = "");
    const e = Math.min(3, this.properties.length);
    for (let s = 0; s < e; s++) {
      const i = (this.active + s) % this.properties.length, r = this.properties[i], a = this.createCarouselItemV5(r, i);
      (t = this.itemsContainer) == null || t.appendChild(a);
    }
    this.leftArrow && (this.leftArrow.style.display = "flex"), this.rightArrow && (this.rightArrow.style.display = "flex");
  }
  createCarouselItemV5(e, t) {
    var S;
    const s = document.createElement("div");
    s.className = "rs-property-carousel__item", s.dataset.index = String(t);
    const i = this.generatePropertyUrl(e), r = ((S = e.images) == null ? void 0 : S[0]) || "/realtysoft/assets/placeholder.jpg";
    let a = "";
    typeof RealtySoftLabels < "u" && RealtySoftLabels.formatPrice ? a = RealtySoftLabels.formatPrice(e.price) : a = e.price ? `€${e.price.toLocaleString()}` : "";
    const l = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M2 4v16"></path>
      <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
      <path d="M2 17h20"></path>
      <path d="M6 8v9"></path>
    </svg>`, d = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"></path>
      <line x1="10" x2="8" y1="5" y2="7"></line>
      <line x1="2" x2="22" y1="12" y2="12"></line>
      <line x1="7" x2="7" y1="19" y2="21"></line>
      <line x1="17" x2="17" y1="19" y2="21"></line>
    </svg>`;
    let y = "";
    e.beds && e.beds > 0 && (y += `<span class="rs-property-carousel__card-spec">${l} ${e.beds}</span>`), e.baths && e.baths > 0 && (y += `<span class="rs-property-carousel__card-spec">${d} ${e.baths}</span>`);
    const p = this.label("card_view") || "View Details";
    return s.innerHTML = `
      <a href="${i}" class="rs-property-carousel__card">
        <div class="rs-property-carousel__card-inner">
          <img src="${r}" alt="${this.escapeHtml(e.title || "")}" class="rs-property-carousel__card-image" loading="lazy">
          <div class="rs-property-carousel__card-overlay">
            <h3 class="rs-property-carousel__card-title">${this.escapeHtml(e.title || "")}</h3>
            ${y ? `<div class="rs-property-carousel__card-specs">${y}</div>` : ""}
            <p class="rs-property-carousel__card-price">${a}</p>
            <span class="rs-property-carousel__card-link">${p} &rarr;</span>
          </div>
        </div>
      </a>
    `, s;
  }
  /**
   * Render items for Template 6 (Dark Cards with Numbers)
   */
  renderItemsV6() {
    var t;
    if (console.log("[RSPropertyCarousel] Rendering V6 with", this.properties.length, "items, active:", this.active), this.properties.length === 0) {
      this.showEmptyState();
      return;
    }
    this.itemsContainer && (this.itemsContainer.innerHTML = "");
    const e = Math.min(3, this.properties.length);
    for (let s = 0; s < e; s++) {
      const i = (this.active + s) % this.properties.length, r = this.properties[i], a = s === 0, l = String(i + 1).padStart(2, "0"), d = this.createCarouselItemV6(r, i, l, a);
      (t = this.itemsContainer) == null || t.appendChild(d);
    }
    this.leftArrow && (this.leftArrow.style.display = "flex"), this.rightArrow && (this.rightArrow.style.display = "flex");
  }
  createCarouselItemV6(e, t, s, i) {
    var f, u;
    const r = document.createElement("div");
    r.className = `rs-property-carousel__item ${i ? "rs-property-carousel__item--active" : ""}`, r.dataset.index = String(t);
    const a = this.generatePropertyUrl(e), l = ((f = e.images) == null ? void 0 : f[0]) || "/realtysoft/assets/placeholder.jpg";
    let d = "";
    typeof RealtySoftLabels < "u" && RealtySoftLabels.formatPrice ? d = RealtySoftLabels.formatPrice(e.price) : d = e.price ? `€${e.price.toLocaleString()}` : "";
    const y = ((u = e.location) == null ? void 0 : u.name) || e.location || "", p = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M2 4v16"></path>
      <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
      <path d="M2 17h20"></path>
      <path d="M6 8v9"></path>
    </svg>`, S = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"></path>
      <line x1="10" x2="8" y1="5" y2="7"></line>
      <line x1="2" x2="22" y1="12" y2="12"></line>
      <line x1="7" x2="7" y1="19" y2="21"></line>
      <line x1="17" x2="17" y1="19" y2="21"></line>
    </svg>`;
    let C = "";
    e.beds && e.beds > 0 && (C += `<span class="rs-property-carousel__card-spec">${p} ${e.beds} Beds</span>`), e.baths && e.baths > 0 && (C += `<span class="rs-property-carousel__card-spec">${S} ${e.baths} Bath</span>`);
    const k = e.type || "Apartment", L = this.label("view_details") || "View Details";
    return r.innerHTML = `
      <span class="rs-property-carousel__card-number">${s}</span>
      <p class="rs-property-carousel__card-type">${this.escapeHtml(k)}</p>
      ${y ? `<p class="rs-property-carousel__card-location">${this.escapeHtml(String(y))}</p>` : ""}
      <a href="${a}" class="rs-property-carousel__card">
        <div class="rs-property-carousel__card-image-wrapper">
          <img src="${l}" alt="${this.escapeHtml(e.title || "")}" class="rs-property-carousel__card-image" loading="lazy">
          ${e.is_featured ? '<span class="rs-property-carousel__card-badge">POPULAR</span>' : ""}
        </div>
      </a>
      <div class="rs-property-carousel__card-info">
        <p class="rs-property-carousel__card-price">${d}</p>
        ${C ? `<div class="rs-property-carousel__card-specs">${C}</div>` : ""}
      </div>
      <button class="rs-property-carousel__card-view-btn" data-rs-property-url="${a}">${L}</button>
    `, r;
  }
  createCarouselItem(e, t, s) {
    var C;
    const i = document.createElement("div");
    i.className = `rs-property-carousel__item rs-property-carousel__item--level${t < 0 || t > 0 ? t : "0"}`, i.dataset.index = String(s), i.dataset.level = String(t);
    const r = this.generatePropertyUrl(e), a = ((C = e.images) == null ? void 0 : C[0]) || "/realtysoft/assets/placeholder.jpg";
    let l = "";
    typeof RealtySoftLabels < "u" && RealtySoftLabels.formatPrice ? l = RealtySoftLabels.formatPrice(e.price) : l = e.price ? `€${e.price.toLocaleString()}` : "";
    const d = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M2 4v16"></path>
      <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
      <path d="M2 17h20"></path>
      <path d="M6 8v9"></path>
    </svg>`, y = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"></path>
      <line x1="10" x2="8" y1="5" y2="7"></line>
      <line x1="2" x2="22" y1="12" y2="12"></line>
      <line x1="7" x2="7" y1="19" y2="21"></line>
      <line x1="17" x2="17" y1="19" y2="21"></line>
    </svg>`;
    let p = "";
    e.beds && e.beds > 0 && (p += `<span class="rs-property-carousel__card-spec">${d} ${e.beds}</span>`), e.baths && e.baths > 0 && (p += `<span class="rs-property-carousel__card-spec">${y} ${e.baths}</span>`);
    const S = this.label("card_view") || "View Details";
    return i.innerHTML = `
      <a href="${r}" class="rs-property-carousel__card">
        <img src="${a}" alt="${this.escapeHtml(e.title || "")}" class="rs-property-carousel__card-image" loading="lazy">
        <div class="rs-property-carousel__card-overlay">
          <h3 class="rs-property-carousel__card-title">${this.escapeHtml(e.title || "")}</h3>
          ${p ? `<div class="rs-property-carousel__card-specs">${p}</div>` : ""}
          <p class="rs-property-carousel__card-price">${l}</p>
          <span class="rs-property-carousel__card-link">${S} &rarr;</span>
        </div>
      </a>
    `, i;
  }
  renderDots() {
    if (this.dotsContainer) {
      if (this.properties.length <= 1) {
        this.dotsContainer.style.display = "none";
        return;
      }
      this.dotsContainer.style.display = "flex", this.dotsContainer.innerHTML = "", this.properties.forEach((e, t) => {
        var i;
        const s = document.createElement("button");
        s.className = `rs-property-carousel__dot ${t === this.active ? "rs-property-carousel__dot--active" : ""}`, s.dataset.index = String(t), s.type = "button", s.setAttribute("aria-label", `Go to slide ${t + 1}`), (i = this.dotsContainer) == null || i.appendChild(s);
      });
    }
  }
  updateDots() {
    if (!this.dotsContainer) return;
    this.dotsContainer.querySelectorAll(".rs-property-carousel__dot").forEach((t, s) => {
      t.classList.toggle("rs-property-carousel__dot--active", s === this.active);
    });
  }
  moveLeft() {
    this.properties.length <= 1 || this.isAnimating || (this.isAnimating = !0, this.active = this.active - 1 < 0 ? this.properties.length - 1 : this.active - 1, this.renderItems(), this.updateDots(), setTimeout(() => {
      this.isAnimating = !1;
    }, 400));
  }
  moveRight() {
    this.properties.length <= 1 || this.isAnimating || (this.isAnimating = !0, this.active = (this.active + 1) % this.properties.length, this.renderItems(), this.updateDots(), setTimeout(() => {
      this.isAnimating = !1;
    }, 400));
  }
  goToSlide(e) {
    e === this.active || e < 0 || e >= this.properties.length || this.isAnimating || (this.isAnimating = !0, this.active = e, this.renderItems(), this.updateDots(), setTimeout(() => {
      this.isAnimating = !1;
    }, 400));
  }
  startAutoPlay() {
    !this.autoPlay || this.properties.length <= 1 || (this.stopAutoPlay(), this.autoPlayTimer = setInterval(() => {
      this.moveRight();
    }, this.autoPlayInterval));
  }
  stopAutoPlay() {
    this.autoPlayTimer && (clearInterval(this.autoPlayTimer), this.autoPlayTimer = null);
  }
  escapeHtml(e) {
    if (!e) return "";
    const t = document.createElement("div");
    return t.textContent = e, t.innerHTML;
  }
  destroy() {
    this.stopAutoPlay(), super.destroy();
  }
}
RealtySoft.registerComponent("rs_property_carousel", ut);
class _t extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "currentPage", 1);
    o(this, "totalPages", 0);
    o(this, "loading", !1);
    this.init();
  }
  init() {
    this.currentPage = 1, this.totalPages = 0, this.loading = !1, this.render(), this.bindEvents(), this.subscribe("results.page", (e) => {
      this.currentPage = e, this.updateDisplay();
    }), this.subscribe("results.totalPages", (e) => {
      this.totalPages = e, this.updateDisplay();
    }), this.subscribe("ui.loading", (e) => {
      this.loading = e, this.updateDisplay();
    });
  }
  render() {
    this.element.classList.add("rs-pagination"), this.updateDisplay();
  }
  bindEvents() {
    this.element.addEventListener("click", (e) => {
      if (this.loading) return;
      const s = e.target.closest("button");
      s && (e.preventDefault(), s.classList.contains("rs-pagination__prev") ? this.goToPage(this.currentPage - 1) : s.classList.contains("rs-pagination__next") ? this.goToPage(this.currentPage + 1) : s.classList.contains("rs-pagination__page") ? this.goToPage(parseInt(s.dataset.page || "1")) : s.classList.contains("rs-pagination__load-more") && this.loadMore());
    });
  }
  goToPage(e) {
    if (e < 1 || e > this.totalPages || e === this.currentPage) return;
    RealtySoft.goToPage(e);
    const t = document.querySelector(".rs_property_grid");
    t && t.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  loadMore() {
    this.currentPage < this.totalPages && RealtySoft.goToPage(this.currentPage + 1);
  }
  updateDisplay() {
    if (this.totalPages <= 1) {
      this.element.innerHTML = "";
      return;
    }
    const e = this.getPageNumbers();
    this.element.innerHTML = `
      <div class="rs-pagination__wrapper">
        <button type="button"
                class="rs-pagination__btn rs-pagination__prev"
                ${this.currentPage === 1 || this.loading ? "disabled" : ""}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          <span>${this.label("pagination_prev")}</span>
        </button>

        <div class="rs-pagination__pages">
          ${e.map((t) => t === "..." ? '<span class="rs-pagination__ellipsis">...</span>' : `
              <button type="button"
                      class="rs-pagination__btn rs-pagination__page ${t === this.currentPage ? "rs-pagination__page--active" : ""}"
                      data-page="${t}"
                      ${this.loading ? "disabled" : ""}>
                ${t}
              </button>
            `).join("")}
        </div>

        <button type="button"
                class="rs-pagination__btn rs-pagination__next"
                ${this.currentPage === this.totalPages || this.loading ? "disabled" : ""}>
          <span>${this.label("pagination_next")}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      <div class="rs-pagination__info">
        ${this.label("pagination_page")}&nbsp;${this.currentPage}&nbsp;${this.label("pagination_of")}&nbsp;${this.totalPages}
      </div>
    `;
  }
  getPageNumbers() {
    const e = [], t = this.currentPage, s = this.totalPages, i = 2;
    e.push(1);
    const r = Math.max(2, t - i), a = Math.min(s - 1, t + i);
    r > 2 && e.push("...");
    for (let l = r; l <= a; l++)
      e.push(l);
    return a < s - 1 && e.push("..."), s > 1 && e.push(s), e;
  }
}
RealtySoft.registerComponent("rs_pagination", _t);
class mt extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "currentSort", "create_date_desc");
    o(this, "sortOptions", []);
    o(this, "select", null);
    this.init();
  }
  init() {
    this.currentSort = window.RealtySoftState.get("ui.sort") || "create_date_desc", this.buildSortOptions(), this.render(), this.bindEvents(), this.subscribe("ui.sort", (e) => {
      this.currentSort = e, this.updateDisplay();
    }), this.subscribe("config.language", () => {
      this.buildSortOptions(), this.render(), this.bindEvents();
    });
  }
  buildSortOptions() {
    this.sortOptions = [
      { value: "create_date_desc", label: this.label("sort_newest") || "Newest Listings" },
      { value: "create_date", label: this.label("sort_oldest") || "Oldest Listings" },
      { value: "last_date_desc", label: this.label("sort_updated") || "Recently Updated" },
      { value: "last_date", label: this.label("sort_oldest_updated") || "Oldest Updated" },
      { value: "list_price", label: this.label("sort_price_asc") || "Price: Low to High" },
      { value: "list_price_desc", label: this.label("sort_price_desc") || "Price: High to Low" },
      { value: "is_featured_desc", label: this.label("sort_featured") || "Featured First" },
      { value: "location_id", label: this.label("sort_location") || "By Location" },
      { value: "is_own_desc", label: this.label("sort_own") || "Own Properties First" }
    ];
  }
  render() {
    this.element.classList.add("rs-sort"), this.element.innerHTML = `
      <div class="rs-sort__wrapper">
        <label class="rs-sort__label">${this.label("results_sort")}</label>
        <div class="rs-sort__select-wrapper">
          <select class="rs-sort__select">
            ${this.sortOptions.map((e) => `
              <option value="${e.value}" ${this.currentSort === e.value ? "selected" : ""}>
                ${e.label}
              </option>
            `).join("")}
          </select>
          <span class="rs-sort__icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </span>
        </div>
      </div>
    `, this.select = this.element.querySelector(".rs-sort__select");
  }
  bindEvents() {
    this.select && this.select.addEventListener("change", (e) => {
      const t = e.target;
      RealtySoft.setSort(t.value);
    });
  }
  updateDisplay() {
    this.select && (this.select.value = this.currentSort);
  }
}
RealtySoft.registerComponent("rs_sort", mt);
class yt extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "total", 0);
    o(this, "loading", !1);
    this.init();
  }
  init() {
    this.total = 0, this.loading = !1, this.render(), this.subscribe("results.total", (e) => {
      this.total = e, this.updateDisplay();
    }), this.subscribe("ui.loading", (e) => {
      this.loading = e, this.updateDisplay();
    });
  }
  render() {
    this.element.classList.add("rs-results-count"), this.updateDisplay();
  }
  updateDisplay() {
    if (this.loading) {
      this.element.innerHTML = `<span class="rs-results-count__text rs-results-count__text--loading">${this.label("results_loading")}</span>`;
      return;
    }
    let e;
    this.total === 0 ? e = this.label("results_count_zero") : this.total === 1 ? e = this.label("results_count_one") : e = this.label("results_count", { count: this.total.toLocaleString() }), this.element.innerHTML = `<span class="rs-results-count__text">${e}</span>`;
  }
}
RealtySoft.registerComponent("rs_results_count", yt);
class gt extends A {
  constructor(n, e = {}) {
    super(n, e), this.init();
  }
  init() {
    this.render(), this.subscribe("filters", () => {
      this.updateDisplay();
    }), this.subscribe("data.features", () => {
      this.updateDisplay();
    }), this.loadFeaturesIfNeeded();
  }
  async loadFeaturesIfNeeded() {
    const n = RealtySoftState.get("filters"), e = RealtySoftState.get("data.features");
    if (n != null && n.features && n.features.length > 0 && (!e || e.length === 0))
      try {
        const t = await RealtySoftAPI.getFeatures();
        t.data && RealtySoftState.set("data.features", t.data);
      } catch (t) {
        console.warn("[RealtySoft] Could not load features for active filters:", t);
      }
  }
  render() {
    this.element.classList.add("rs-active-filters"), this.updateDisplay();
  }
  /**
   * Resolve a location ID to its name by searching through
   * the locations tree (including children).
   */
  resolveLocationName(n) {
    const e = RealtySoftState.get("data.locations") || [], t = (s) => {
      for (const i of s) {
        if (i.id === n) return i.name;
        if (i.children) {
          const r = t(i.children);
          if (r) return r;
        }
      }
      return null;
    };
    return t(e) || String(n);
  }
  /**
   * Resolve a property type ID to its name from the flat
   * property types list.
   */
  resolvePropertyTypeName(n) {
    const t = (RealtySoftState.get("data.propertyTypes") || []).find((s) => s.id === n);
    return t ? t.name : String(n);
  }
  /**
   * Resolve one or more IDs to display names using the given resolver.
   */
  resolveIds(n, e) {
    return Array.isArray(n) ? n.map(e).join(", ") : e(n);
  }
  /**
   * Resolve a feature ID to its name by searching through
   * the nested features structure (categories with value_ids).
   */
  resolveFeatureName(n) {
    const e = RealtySoftState.get("data.features") || [];
    for (const t of e) {
      if (t.value_ids && Array.isArray(t.value_ids)) {
        const s = t.value_ids.find((i) => i.id === n);
        if (s) return s.name;
      }
      if (t.id === n && t.name)
        return t.name;
    }
    return String(n);
  }
  getActiveFilters() {
    const n = RealtySoftState.get("filters"), e = [];
    if (!n) return e;
    if (n.location && !RealtySoftState.isFilterLocked("location")) {
      let t = n.locationName || "";
      if (!t) {
        const s = n.location;
        let i;
        typeof s == "string" ? i = s.split(",").map((r) => parseInt(r.trim(), 10)).filter((r) => !isNaN(r)) : Array.isArray(s) ? i = s : i = [s], t = i.map((r) => this.resolveLocationName(r)).join(", ");
      }
      e.push({
        name: "location",
        label: this.label("search_location"),
        value: t
      });
    }
    if (n.listingType && !RealtySoftState.isFilterLocked("listingType")) {
      const t = {
        resale: this.label("listing_type_sale") || "ReSale",
        development: this.label("listing_type_new") || "New Development",
        long_rental: this.label("listing_type_long_rental") || "Long Term Rental",
        short_rental: this.label("listing_type_short_rental") || "Holiday Rental"
      }, s = Array.isArray(n.listingType) ? n.listingType.map((i) => t[i] || i).join(", ") : t[n.listingType] || n.listingType;
      e.push({
        name: "listingType",
        label: this.label("search_listing_type"),
        value: s
      });
    }
    if (n.propertyType && !RealtySoftState.isFilterLocked("propertyType")) {
      const t = n.propertyTypeName || this.resolveIds(
        n.propertyType,
        (s) => this.resolvePropertyTypeName(s)
      );
      e.push({
        name: "propertyType",
        label: this.label("search_property_type"),
        value: t
      });
    }
    if ((n.bedsMin || n.bedsMax) && !RealtySoftState.isFilterLocked("bedsMin")) {
      let t = "";
      n.bedsMin && n.bedsMax ? t = `${n.bedsMin} - ${n.bedsMax}` : n.bedsMin ? t = `${n.bedsMin}+` : t = `≤ ${n.bedsMax}`, e.push({
        name: "beds",
        label: this.label("search_bedrooms"),
        value: t
      });
    }
    if ((n.bathsMin || n.bathsMax) && !RealtySoftState.isFilterLocked("bathsMin")) {
      let t = "";
      n.bathsMin && n.bathsMax ? t = `${n.bathsMin} - ${n.bathsMax}` : n.bathsMin ? t = `${n.bathsMin}+` : t = `≤ ${n.bathsMax}`, e.push({
        name: "baths",
        label: this.label("search_bathrooms"),
        value: t
      });
    }
    if ((n.priceMin || n.priceMax) && !RealtySoftState.isFilterLocked("priceMin")) {
      let t = "";
      n.priceMin && n.priceMax ? t = `${RealtySoftLabels.formatPrice(n.priceMin)} - ${RealtySoftLabels.formatPrice(n.priceMax)}` : n.priceMin ? t = `≥ ${RealtySoftLabels.formatPrice(n.priceMin)}` : n.priceMax && (t = `≤ ${RealtySoftLabels.formatPrice(n.priceMax)}`), e.push({
        name: "price",
        label: this.label("search_price"),
        value: t
      });
    }
    if ((n.builtMin || n.builtMax) && !RealtySoftState.isFilterLocked("builtMin")) {
      let t = "";
      n.builtMin && n.builtMax ? t = `${n.builtMin} - ${n.builtMax} m²` : n.builtMin ? t = `≥ ${n.builtMin} m²` : n.builtMax && (t = `≤ ${n.builtMax} m²`), e.push({
        name: "built",
        label: this.label("search_built_area"),
        value: t
      });
    }
    if ((n.plotMin || n.plotMax) && !RealtySoftState.isFilterLocked("plotMin")) {
      let t = "";
      n.plotMin && n.plotMax ? t = `${n.plotMin} - ${n.plotMax} m²` : n.plotMin ? t = `≥ ${n.plotMin} m²` : n.plotMax && (t = `≤ ${n.plotMax} m²`), e.push({
        name: "plot",
        label: this.label("search_plot_size"),
        value: t
      });
    }
    if (n.features && n.features.length && !RealtySoftState.isFilterLocked("features")) {
      const t = n.features.map((s) => this.resolveFeatureName(s));
      e.push({
        name: "features",
        label: this.label("search_features"),
        value: t.join(", ")
      });
    }
    return n.ref && !RealtySoftState.isFilterLocked("ref") && e.push({
      name: "ref",
      label: this.label("search_reference"),
      value: n.ref
    }), e;
  }
  updateDisplay() {
    const n = this.getActiveFilters();
    if (n.length === 0) {
      this.element.innerHTML = "", this.element.style.display = "none";
      return;
    }
    this.element.style.display = "block", this.element.innerHTML = `
      <div class="rs-active-filters__wrapper">
        <div class="rs-active-filters__tags">
          ${n.map((e) => `
            <span class="rs-active-filters__tag">
              <span class="rs-active-filters__tag-label">${e.label}:</span>
              <span class="rs-active-filters__tag-value">${this.escapeHtml(e.value)}</span>
            </span>
          `).join("")}
        </div>
      </div>
    `;
  }
  escapeHtml(n) {
    if (!n) return "";
    const e = document.createElement("div");
    return e.textContent = n, e.innerHTML;
  }
}
RealtySoft.registerComponent("rs_active_filters", gt);
class ft extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "currentView", "grid");
    this.init();
  }
  init() {
    this.currentView = window.RealtySoftState.get("ui.view") || "grid", this.render(), this.bindEvents(), this.subscribe("ui.view", (e) => {
      this.currentView = e, this.updateDisplay();
    });
  }
  render() {
    this.element.classList.add("rs-view-toggle"), this.element.innerHTML = `
      <div class="rs-view-toggle__wrapper">
        <button type="button"
                class="rs-view-toggle__btn rs-view-toggle__btn--grid ${this.currentView === "grid" ? "rs-view-toggle__btn--active" : ""}"
                data-view="grid"
                aria-label="${this.label("results_view_grid")}"
                title="${this.label("results_view_grid")}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        </button>
        <button type="button"
                class="rs-view-toggle__btn rs-view-toggle__btn--list ${this.currentView === "list" ? "rs-view-toggle__btn--active" : ""}"
                data-view="list"
                aria-label="${this.label("results_view_list")}"
                title="${this.label("results_view_list")}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
        </button>
      </div>
    `;
  }
  bindEvents() {
    this.element.querySelectorAll(".rs-view-toggle__btn").forEach((e) => {
      e.addEventListener("click", (t) => {
        const i = t.currentTarget.dataset.view;
        i && RealtySoft.setView(i);
      });
    });
  }
  updateDisplay() {
    this.element.querySelectorAll(".rs-view-toggle__btn").forEach((e) => {
      e.classList.toggle("rs-view-toggle__btn--active", e.dataset.view === this.currentView);
    });
  }
}
RealtySoft.registerComponent("rs_view_toggle", ft);
const we = /* @__PURE__ */ new Map();
let me = null;
const ke = /* @__PURE__ */ new WeakMap();
function vt() {
  return me || (typeof IntersectionObserver > "u" ? null : (me = new IntersectionObserver((_) => {
    _.forEach((n) => {
      if (n.isIntersecting) {
        const e = ke.get(n.target);
        e && (e(), ke.delete(n.target), me == null || me.unobserve(n.target));
      }
    });
  }, {
    rootMargin: "200px 0px",
    threshold: 0.01
  }), me));
}
function le(_, n) {
  if (_.dataset.rsLazy === "false") {
    n();
    return;
  }
  const e = vt();
  if (!e) {
    n();
    return;
  }
  ke.set(_, n), e.observe(_);
}
async function ne(_) {
  var i, r;
  const n = _.dataset.rsPropertyRef || ((i = _.closest("[data-rs-property-ref]")) == null ? void 0 : i.getAttribute("data-rs-property-ref")), e = _.dataset.rsPropertyId || ((r = _.closest("[data-rs-property-id]")) == null ? void 0 : r.getAttribute("data-rs-property-id"));
  if (!n && !e) return null;
  const t = n ? `ref:${n}` : `id:${e}`;
  if (we.has(t))
    return we.get(t);
  const s = (async () => {
    try {
      return n ? (await RealtySoftAPI.getPropertyByRef(n)).data : e ? (await RealtySoftAPI.getProperty(Number(e))).data : null;
    } catch {
      return null;
    } finally {
      we.delete(t);
    }
  })();
  return we.set(t, s), s;
}
function Re(_) {
  if (!_) return "";
  const n = document.createElement("div");
  return n.textContent = _, n.innerHTML;
}
function bt(_) {
  if (_.url) return _.url;
  const n = RealtySoftState.get("config.propertyPageSlug") || "property", e = _.ref || _.id, t = RealtySoftState.get("config.propertyUrlFormat") || "seo";
  if (t === "query")
    return `/${n}?ref=${e}`;
  if (t === "ref")
    return `/${n}/${e}`;
  const i = (_.title || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").substring(0, 80);
  return `/${n}/${i}-${e}`;
}
const _e = {
  mapPin: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>',
  bed: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 4v16"></path><path d="M2 8h18a2 2 0 0 1 2 2v10"></path><path d="M2 17h20"></path><path d="M6 8v9"></path></svg>',
  bath: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"></path><line x1="10" x2="8" y1="5" y2="7"></line><line x1="2" x2="22" y1="12" y2="12"></line><line x1="7" x2="7" y1="19" y2="21"></line><line x1="17" x2="17" y1="19" y2="21"></line></svg>',
  builtArea: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>',
  plotSize: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6l9-4 9 4v12l-9 4-9-4V6z"></path><path d="M12 2v20"></path><path d="M3 6l9 4 9-4"></path></svg>',
  heart: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>',
  heartFilled: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>'
};
class wt extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "property", null);
    this.init();
  }
  init() {
    this.element.closest(".rs_property_grid") || le(this.element, () => this.loadAndRender());
  }
  async loadAndRender() {
    this.property = await ne(this.element), this.property && (this.render(), this.bindEvents());
  }
  render() {
    if (!this.property) return;
    const e = parseInt(this.element.dataset.rsMaxImages || "5") || 5, s = (this.property.images || []).slice(0, e), i = (this.property.imagesWithSizes || []).slice(0, e);
    if (s.length === 0) {
      this.element.innerHTML = `<img src="/realtysoft/assets/placeholder.jpg" alt="${Re(this.property.title || "")}" loading="eager">`;
      return;
    }
    if (s.length === 1) {
      const a = i[0], l = this.buildSrcset(a), d = l ? ` srcset="${l}" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"` : "";
      this.element.innerHTML = `<img src="${s[0]}"${d} alt="${Re(this.property.title || "")}" loading="eager">`;
      return;
    }
    const r = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";
    this.element.innerHTML = `
      <div class="rs-card__carousel">
        <div class="rs-card__carousel-track">
          ${s.map((a, l) => {
      const d = i[l], y = this.buildSrcset(d);
      if (l === 0) {
        const p = y ? ` srcset="${y}" sizes="${r}"` : "";
        return `<div class="rs-card__carousel-slide rs-card__carousel-slide--active">
                <img src="${a}"${p} loading="eager" fetchpriority="high" alt="">
              </div>`;
      } else {
        const p = y ? ` data-srcset="${y}" data-sizes="${r}"` : "";
        return `<div class="rs-card__carousel-slide">
                <img data-src="${a}"${p} loading="lazy" alt="">
              </div>`;
      }
    }).join("")}
        </div>
        <button class="rs-card__carousel-prev" type="button" aria-label="Previous">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <button class="rs-card__carousel-next" type="button" aria-label="Next">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
        <div class="rs-card__carousel-dots">
          ${s.map((a, l) => `<span class="rs-card__carousel-dot ${l === 0 ? "rs-card__carousel-dot--active" : ""}" data-index="${l}"></span>`).join("")}
        </div>
      </div>
    `;
  }
  bindEvents() {
    var l, d;
    const e = this.element.querySelector(".rs-card__carousel");
    if (!e) return;
    const t = e.querySelectorAll(".rs-card__carousel-slide"), s = e.querySelectorAll(".rs-card__carousel-dot"), i = t.length;
    let r = 0;
    const a = (y) => {
      y < 0 && (y = i - 1), y >= i && (y = 0), t.forEach((S, C) => S.classList.toggle("rs-card__carousel-slide--active", C === y)), s.forEach((S, C) => S.classList.toggle("rs-card__carousel-dot--active", C === y)), r = y;
      const p = t[y].querySelector("img");
      p && p.dataset.src && !p.src && (p.src = p.dataset.src, p.dataset.srcset && (p.srcset = p.dataset.srcset, p.sizes = p.dataset.sizes || ""));
    };
    (l = e.querySelector(".rs-card__carousel-prev")) == null || l.addEventListener("click", (y) => {
      y.preventDefault(), y.stopPropagation(), a(r - 1);
    }), (d = e.querySelector(".rs-card__carousel-next")) == null || d.addEventListener("click", (y) => {
      y.preventDefault(), y.stopPropagation(), a(r + 1);
    }), s.forEach((y) => {
      y.addEventListener("click", (p) => {
        p.preventDefault(), p.stopPropagation(), a(parseInt(y.dataset.index || "0"));
      });
    });
  }
  buildSrcset(e) {
    if (!(e != null && e.sizes)) return "";
    const t = [];
    return e.sizes[256] && t.push(`${e.sizes[256]} 256w`), e.sizes[512] && t.push(`${e.sizes[512]} 512w`), e.sizes[768] && t.push(`${e.sizes[768]} 768w`), t.join(", ");
  }
}
RealtySoft.registerComponent("rs_card_image", wt);
class St extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "property", null);
    this.init();
  }
  init() {
    this.element.closest(".rs_property_grid") || le(this.element, () => this.loadAndRender());
  }
  async loadAndRender() {
    this.property = await ne(this.element), this.property && this.render();
  }
  render() {
    this.property && (this.property.price_on_request || !this.property.price && this.property.price !== 0 ? this.element.textContent = this.label("detail_price_on_request") || "Price on Request" : this.element.textContent = RealtySoftLabels.formatPrice(this.property.price));
  }
}
RealtySoft.registerComponent("rs_card_price", St);
class xt extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "property", null);
    this.init();
  }
  init() {
    this.element.closest(".rs_property_grid") || le(this.element, () => this.loadAndRender());
  }
  async loadAndRender() {
    this.property = await ne(this.element), this.property && this.render();
  }
  render() {
    this.property && (this.element.textContent = this.property.title || "");
  }
}
RealtySoft.registerComponent("rs_card_title", xt);
class kt extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "property", null);
    this.init();
  }
  init() {
    this.element.closest(".rs_property_grid") || le(this.element, () => this.loadAndRender());
  }
  async loadAndRender() {
    this.property = await ne(this.element), this.property && this.render();
  }
  render() {
    if (!this.property) return;
    const e = String(this.property.location || "");
    if (!e) {
      this.element.style.display = "none";
      return;
    }
    this.element.dataset.rsShowIcon !== "false" ? this.element.innerHTML = `${_e.mapPin} ${this.escapeText(e)}` : this.element.textContent = e;
  }
  escapeText(e) {
    const t = document.createElement("div");
    return t.textContent = e, t.innerHTML;
  }
}
RealtySoft.registerComponent("rs_card_location", kt);
class Lt extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "property", null);
    this.init();
  }
  init() {
    this.element.closest(".rs_property_grid") || le(this.element, () => this.loadAndRender());
  }
  async loadAndRender() {
    this.property = await ne(this.element), this.property && this.render();
  }
  render() {
    if (!this.property || !this.property.beds || this.property.beds <= 0) {
      this.element.style.display = "none";
      return;
    }
    const e = this.property.beds === 1 ? this.label("card_bed") : this.label("card_beds");
    this.element.innerHTML = `${_e.bed} ${this.property.beds} ${e}`;
  }
}
RealtySoft.registerComponent("rs_card_beds", Lt);
class Ct extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "property", null);
    this.init();
  }
  init() {
    this.element.closest(".rs_property_grid") || le(this.element, () => this.loadAndRender());
  }
  async loadAndRender() {
    this.property = await ne(this.element), this.property && this.render();
  }
  render() {
    if (!this.property || !this.property.baths || this.property.baths <= 0) {
      this.element.style.display = "none";
      return;
    }
    const e = this.property.baths === 1 ? this.label("card_bath") : this.label("card_baths");
    this.element.innerHTML = `${_e.bath} ${this.property.baths} ${e}`;
  }
}
RealtySoft.registerComponent("rs_card_baths", Ct);
class Mt extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "property", null);
    this.init();
  }
  init() {
    this.element.closest(".rs_property_grid") || le(this.element, () => this.loadAndRender());
  }
  async loadAndRender() {
    this.property = await ne(this.element), this.property && this.render();
  }
  render() {
    if (!this.property || !this.property.built_area || this.property.built_area <= 0) {
      this.element.style.display = "none";
      return;
    }
    this.element.innerHTML = `${_e.builtArea} ${this.property.built_area} ${this.label("card_built")}`;
  }
}
RealtySoft.registerComponent("rs_card_built", Mt);
class $t extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "property", null);
    this.init();
  }
  init() {
    this.element.closest(".rs_property_grid") || le(this.element, () => this.loadAndRender());
  }
  async loadAndRender() {
    this.property = await ne(this.element), this.property && this.render();
  }
  render() {
    if (!this.property || !this.property.plot_size || this.property.plot_size <= 0) {
      this.element.style.display = "none";
      return;
    }
    this.element.innerHTML = `${_e.plotSize} ${this.property.plot_size} ${this.label("card_plot")}`;
  }
}
RealtySoft.registerComponent("rs_card_plot", $t);
class Et extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "property", null);
    this.init();
  }
  init() {
    this.element.closest(".rs_property_grid") || le(this.element, () => this.loadAndRender());
  }
  async loadAndRender() {
    this.property = await ne(this.element), this.property && this.render();
  }
  render() {
    if (!this.property) return;
    const e = this.property.ref || "";
    if (!e) {
      this.element.style.display = "none";
      return;
    }
    this.element.textContent = `${this.label("card_ref")} ${e}`;
  }
}
RealtySoft.registerComponent("rs_card_ref", Et);
class Tt extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "property", null);
    this.init();
  }
  init() {
    this.element.closest(".rs_property_grid") || le(this.element, () => this.loadAndRender());
  }
  async loadAndRender() {
    this.property = await ne(this.element), this.property && this.render();
  }
  render() {
    if (!this.property || !this.property.type) {
      this.element.style.display = "none";
      return;
    }
    this.element.textContent = this.property.type;
  }
}
RealtySoft.registerComponent("rs_card_type", Tt);
const Rt = {
  resale: "rs-card__tag--sale",
  sale: "rs-card__tag--sale",
  development: "rs-card__tag--development",
  new_development: "rs-card__tag--development",
  long_rental: "rs-card__tag--rental",
  rent: "rs-card__tag--rental",
  short_rental: "rs-card__tag--holiday",
  holiday: "rs-card__tag--holiday"
}, Pt = {
  resale: "listing_type_sale",
  sale: "listing_type_sale",
  development: "listing_type_new",
  new_development: "listing_type_new",
  long_rental: "listing_type_long_rental",
  rent: "listing_type_long_rental",
  short_rental: "listing_type_short_rental",
  holiday: "listing_type_short_rental"
};
class It extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "property", null);
    this.init();
  }
  init() {
    this.element.closest(".rs_property_grid") || le(this.element, () => this.loadAndRender());
  }
  async loadAndRender() {
    this.property = await ne(this.element), this.property && this.render();
  }
  render() {
    if (!this.property) return;
    const e = [], t = this.property.listing_type;
    if (t) {
      const s = t.toLowerCase(), i = Rt[s] || "rs-card__tag--sale", r = Pt[s], a = r ? this.label(r) : t;
      e.push(`<span class="rs-card__tag ${i}">${a}</span>`);
    }
    if (this.property.is_featured && e.push(`<span class="rs-card__tag rs-card__tag--featured">${this.label("featured")}</span>`), this.property.is_own && e.push(`<span class="rs-card__tag rs-card__tag--own">${this.label("own")}</span>`), e.length === 0) {
      this.element.style.display = "none";
      return;
    }
    this.element.innerHTML = e.join("");
  }
}
RealtySoft.registerComponent("rs_card_status", It);
class At extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "property", null);
    this.init();
  }
  init() {
    this.element.closest(".rs_property_grid") || le(this.element, () => this.loadAndRender());
  }
  async loadAndRender() {
    this.property = await ne(this.element), this.property && (this.render(), this.bindEvents());
  }
  render() {
    if (!this.property) return;
    const e = this.property.ref || this.property.id, t = typeof WishlistManager < "u" && (WishlistManager == null ? void 0 : WishlistManager.has(e)) || RealtySoftState.isInWishlist(this.property.id);
    this.element.classList.add("rs-card__wishlist"), this.element.classList.toggle("rs-card__wishlist--active", t), this.element.tagName !== "BUTTON" && this.element.setAttribute("role", "button"), this.element.setAttribute("aria-label", this.label("wishlist_add")), this.element.innerHTML = t ? _e.heartFilled : _e.heart;
  }
  bindEvents() {
    this.element.addEventListener("click", (e) => {
      e.preventDefault(), e.stopPropagation(), this.toggleWishlist();
    });
  }
  toggleWishlist() {
    if (this.property)
      try {
        const e = this.property.ref || this.property.id, t = typeof WishlistManager < "u" && WishlistManager;
        if (t && WishlistManager.has(e)) {
          WishlistManager.remove(e), this.element.classList.remove("rs-card__wishlist--active"), this.element.innerHTML = _e.heart;
          try {
            RealtySoftAnalytics.trackWishlistRemove(this.property.id);
          } catch {
          }
          typeof RealtySoftToast < "u" && RealtySoftToast && RealtySoftToast.success(this.label("wishlist_removed") || "Removed from wishlist");
        } else {
          let s = !1;
          if (t && (s = WishlistManager.add({
            id: this.property.id,
            ref_no: e,
            title: this.property.title,
            price: this.property.price,
            location: this.property.location,
            type: this.property.type,
            beds: this.property.beds,
            baths: this.property.baths,
            built: this.property.built_area,
            plot: this.property.plot_size,
            images: this.property.images || [],
            total_images: this.property.total_images || (this.property.images || []).length,
            listing_type: this.property.listing_type,
            is_featured: this.property.is_featured || !1
          })), s) {
            this.element.classList.add("rs-card__wishlist--active"), this.element.innerHTML = _e.heartFilled;
            try {
              RealtySoftAnalytics.trackWishlistAdd(this.property.id);
            } catch {
            }
            typeof RealtySoftToast < "u" && RealtySoftToast && RealtySoftToast.success(this.label("wishlist_add") || "Added to wishlist");
          } else {
            console.error("[CardWishlist] Failed to add to wishlist. WishlistManager available:", !!t), typeof RealtySoftToast < "u" && RealtySoftToast && RealtySoftToast.error(this.label("wishlist_error") || "Could not add to wishlist.");
            return;
          }
        }
        try {
          RealtySoftState.isInWishlist(this.property.id) ? RealtySoftState.removeFromWishlist(this.property.id) : RealtySoftState.addToWishlist(this.property.id);
        } catch (s) {
          console.warn("[CardWishlist] State sync error (non-critical):", s);
        }
      } catch (e) {
        console.error("[CardWishlist] Wishlist toggle error:", e);
      }
  }
}
RealtySoft.registerComponent("rs_card_wishlist", At);
class qt extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "property", null);
    this.init();
  }
  init() {
    this.element.closest(".rs_property_grid") || le(this.element, () => this.loadAndRender());
  }
  async loadAndRender() {
    this.property = await ne(this.element), this.property && this.render();
  }
  render() {
    if (!this.property) return;
    const e = bt(this.property), t = this.property;
    this.element.tagName === "A" ? (this.element.href = e, this.element.addEventListener("click", (s) => {
      const i = s;
      typeof RealtySoftRouter < "u" && RealtySoftRouter.isEnabled() && !i.ctrlKey && !i.metaKey && !i.shiftKey && (s.preventDefault(), RealtySoftRouter.navigateToProperty(t, e));
    })) : (this.element.setAttribute("data-rs-href", e), this.element.style.cursor = "pointer", this.element.addEventListener("click", () => {
      typeof RealtySoftRouter < "u" && RealtySoftRouter.isEnabled() ? RealtySoftRouter.navigateToProperty(t, e) : window.location.href = e;
    }));
  }
}
RealtySoft.registerComponent("rs_card_link", qt);
class zt extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "property", null);
    this.init();
  }
  init() {
    this.element.closest(".rs_property_grid") || le(this.element, () => this.loadAndRender());
  }
  async loadAndRender() {
    this.property = await ne(this.element), this.property && this.render();
  }
  render() {
    if (!this.property) return;
    let e = this.property.short_description || this.property.description || "";
    if (!e) {
      this.element.style.display = "none";
      return;
    }
    const t = parseInt(this.element.dataset.rsMaxLength || "0") || 0;
    t > 0 && e.length > t && (e = e.substring(0, t).trimEnd() + "..."), this.element.textContent = e;
  }
}
RealtySoft.registerComponent("rs_card_description", zt);
class Bt extends A {
  constructor(n, e = {}) {
    super(n, e), this.init();
  }
  init() {
    this.render(), this.bindEvents();
  }
  render() {
    this.element.classList.add("rs-detail-back");
    const n = this.getSearchUrl();
    this.element.innerHTML = `
      <a href="${n}" class="rs-detail-back__btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        <span>${this.label("detail_back_to_search") || "Back to Search"}</span>
      </a>
    `;
  }
  getSearchUrl() {
    const n = document.referrer;
    if (n && n.includes(window.location.hostname) && (n.includes("search") || n.includes("listing") || n.includes("properties") || n.includes("property-list")))
      return n;
    const e = sessionStorage.getItem("rs_last_search_url");
    return e || (this.element.dataset.searchUrl ? this.element.dataset.searchUrl : "javascript:history.back()");
  }
  bindEvents() {
    const n = this.element.querySelector(".rs-detail-back__btn");
    if (!n) return;
    const e = n.getAttribute("href");
    n.addEventListener("click", (t) => {
      if (typeof RealtySoftRouter < "u" && RealtySoftRouter.canGoBackToListing()) {
        t.preventDefault(), RealtySoftRouter.navigateToListing();
        return;
      }
      e === "javascript:history.back()" && (t.preventDefault(), window.history.length > 1 ? window.history.back() : window.location.href = "/");
    });
  }
}
class Ie extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "property", null);
    o(this, "images", []);
    o(this, "currentIndex", 0);
    o(this, "lightboxOpen", !1);
    o(this, "mainImage", null);
    o(this, "counter", null);
    o(this, "thumbs", document.querySelectorAll(".nonexistent"));
    o(this, "lightbox", null);
    o(this, "lightboxImage", null);
    o(this, "lightboxCounter", null);
    this.init();
  }
  init() {
    var e;
    if (this.property = (e = this.options) == null ? void 0 : e.property, !this.property) {
      this.element.style.display = "none";
      return;
    }
    if (this.images = this.property.imagesFull || this.property.images || [], this.currentIndex = 0, this.lightboxOpen = !1, this.images.length === 0) {
      this.element.style.display = "none";
      return;
    }
    this.render(), this.bindEvents();
  }
  render() {
    this.element.classList.add("rs-detail-gallery"), this.element.innerHTML = `
      <div class="rs-detail-gallery__main">
        <div class="rs-detail-gallery__main-image">
          <img src="${this.images[0]}" alt="" class="rs-detail-gallery__image" loading="eager" fetchpriority="high">
          <button class="rs-detail-gallery__fullscreen" type="button" aria-label="Fullscreen">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 3 21 3 21 9"></polyline>
              <polyline points="9 21 3 21 3 15"></polyline>
              <line x1="21" y1="3" x2="14" y2="10"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
          </button>
          ${this.images.length > 1 ? `
            <button class="rs-detail-gallery__nav rs-detail-gallery__nav--prev" type="button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button class="rs-detail-gallery__nav rs-detail-gallery__nav--next" type="button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          ` : ""}
          <div class="rs-detail-gallery__counter">${this.currentIndex + 1} / ${this.images.length}</div>
        </div>
      </div>
      ${this.images.length > 1 ? `
        <div class="rs-detail-gallery__thumbs">
          ${this.images.map((e, t) => `
            <button class="rs-detail-gallery__thumb ${t === 0 ? "rs-detail-gallery__thumb--active" : ""}"
                    type="button"
                    data-index="${t}">
              <img src="${e}" alt="" loading="lazy">
            </button>
          `).join("")}
        </div>
      ` : ""}

      <div class="rs-detail-gallery__lightbox" style="display: none;">
        <div class="rs-detail-gallery__lightbox-backdrop"></div>
        <div class="rs-detail-gallery__lightbox-content">
          <button class="rs-detail-gallery__lightbox-close" type="button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <img src="" alt="" class="rs-detail-gallery__lightbox-image">
          ${this.images.length > 1 ? `
            <button class="rs-detail-gallery__lightbox-nav rs-detail-gallery__lightbox-nav--prev" type="button">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button class="rs-detail-gallery__lightbox-nav rs-detail-gallery__lightbox-nav--next" type="button">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          ` : ""}
          <div class="rs-detail-gallery__lightbox-counter">${this.currentIndex + 1} / ${this.images.length}</div>
        </div>
      </div>
    `, this.mainImage = this.element.querySelector(".rs-detail-gallery__image"), this.counter = this.element.querySelector(".rs-detail-gallery__counter"), this.thumbs = this.element.querySelectorAll(".rs-detail-gallery__thumb"), this.lightbox = this.element.querySelector(".rs-detail-gallery__lightbox"), this.lightboxImage = this.element.querySelector(".rs-detail-gallery__lightbox-image"), this.lightboxCounter = this.element.querySelector(".rs-detail-gallery__lightbox-counter");
  }
  bindEvents() {
    var t, s, i, r, a, l, d, y;
    (t = this.element.querySelector(".rs-detail-gallery__nav--prev")) == null || t.addEventListener("click", () => this.prev()), (s = this.element.querySelector(".rs-detail-gallery__nav--next")) == null || s.addEventListener("click", () => this.next()), this.thumbs.forEach((p) => {
      p.addEventListener("click", () => {
        this.goToImage(parseInt(p.dataset.index || "0"));
      });
    }), (i = this.element.querySelector(".rs-detail-gallery__fullscreen")) == null || i.addEventListener("click", () => this.openLightbox()), (r = this.mainImage) == null || r.addEventListener("click", () => this.openLightbox()), (a = this.element.querySelector(".rs-detail-gallery__lightbox-nav--prev")) == null || a.addEventListener("click", () => this.prev()), (l = this.element.querySelector(".rs-detail-gallery__lightbox-nav--next")) == null || l.addEventListener("click", () => this.next()), (d = this.element.querySelector(".rs-detail-gallery__lightbox-close")) == null || d.addEventListener("click", () => this.closeLightbox()), (y = this.element.querySelector(".rs-detail-gallery__lightbox-backdrop")) == null || y.addEventListener("click", () => this.closeLightbox()), document.addEventListener("keydown", (p) => {
      this.lightboxOpen && (p.key === "ArrowLeft" ? this.prev() : p.key === "ArrowRight" ? this.next() : p.key === "Escape" && this.closeLightbox());
    });
    let e = 0;
    this.element.addEventListener("touchstart", (p) => {
      e = p.touches[0].clientX;
    }), this.element.addEventListener("touchend", (p) => {
      const S = p.changedTouches[0].clientX, C = e - S;
      Math.abs(C) > 50 && (C > 0 ? this.next() : this.prev());
    });
  }
  goToImage(e) {
    e < 0 && (e = this.images.length - 1), e >= this.images.length && (e = 0), this.currentIndex = e, this.mainImage && (this.mainImage.src = this.images[e]), this.counter && (this.counter.textContent = `${e + 1} / ${this.images.length}`), this.thumbs.forEach((t, s) => {
      t.classList.toggle("rs-detail-gallery__thumb--active", s === e);
    }), this.lightboxOpen && (this.lightboxImage && (this.lightboxImage.src = this.images[e]), this.lightboxCounter && (this.lightboxCounter.textContent = `${e + 1} / ${this.images.length}`)), RealtySoftAnalytics.trackGalleryView(this.property.id, e);
  }
  prev() {
    this.goToImage(this.currentIndex - 1);
  }
  next() {
    this.goToImage(this.currentIndex + 1);
  }
  openLightbox() {
    this.lightboxOpen = !0, this.lightbox && (this.lightbox.style.display = "flex"), this.lightboxImage && (this.lightboxImage.src = this.images[this.currentIndex]), this.lightboxCounter && (this.lightboxCounter.textContent = `${this.currentIndex + 1} / ${this.images.length}`), document.body.style.overflow = "hidden";
  }
  closeLightbox() {
    this.lightboxOpen = !1, this.lightbox && (this.lightbox.style.display = "none"), document.body.style.overflow = "";
  }
}
class Dt extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "property", null);
    o(this, "features", []);
    this.init();
  }
  init() {
    var e;
    if (this.property = (e = this.options) == null ? void 0 : e.property, !this.property) {
      this.element.style.display = "none";
      return;
    }
    if (this.features = this.property.features || [], this.features.length === 0) {
      this.element.style.display = "none";
      return;
    }
    this.render();
  }
  render() {
    this.element.classList.add("rs-detail-features");
    const e = {};
    this.features.forEach((s) => {
      const i = typeof s == "string" ? s : s.name, r = typeof s == "object" && s.category ? s.category : "Features";
      e[r] || (e[r] = []), e[r].push(i);
    });
    const t = Object.entries(e).map(([s, i]) => `
      <div class="rs-detail-features__group">
        <h3 class="rs-detail-features__title">${this.escapeHtml(s)}</h3>
        <ul class="rs-detail-features__list">
          ${i.map((r) => `
            <li class="rs-detail-features__item">
              <svg class="rs-detail-features__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span class="rs-detail-features__text">${this.escapeHtml(r)}</span>
            </li>
          `).join("")}
        </ul>
      </div>
    `).join("");
    this.element.innerHTML = t;
  }
  escapeHtml(e) {
    if (!e) return "";
    const t = document.createElement("div");
    return t.textContent = e, t.innerHTML;
  }
}
class Ae extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "property", null);
    o(this, "lat", null);
    o(this, "lng", null);
    o(this, "hasCoords", !1);
    o(this, "locationName", "");
    o(this, "municipality", "");
    o(this, "province", "");
    o(this, "zipcode", "");
    o(this, "country", "Spain");
    o(this, "displayLocation", "");
    o(this, "currentMode", "municipality");
    o(this, "mapContainerId", "");
    o(this, "hasInitiallyRendered", !1);
    this.init();
  }
  init() {
    var p;
    if (this.property = (p = this.options) == null ? void 0 : p.property, !this.property) {
      this.element.style.display = "none";
      return;
    }
    const e = this.property, t = e._original || {};
    this.lat = e.latitude || t.latitude || t.lat || null, this.lng = e.longitude || t.longitude || t.lng || null, this.hasCoords = this.hasValidCoordinates();
    const s = t.location_id, i = t.municipality_id, r = t.province_id;
    if (this.locationName = (s == null ? void 0 : s.name) || e.location || "", this.municipality = (i == null ? void 0 : i.name) || t.municipality || "", this.province = (r == null ? void 0 : r.name) || t.province || "", this.zipcode = e.postal_code || t.zipcode || t.postal_code || "", this.country = t.country || "Spain", this.displayLocation = this.buildDisplayLocation(), !(this.locationName || this.municipality || this.province || this.zipcode || this.hasCoords)) {
      this.element.style.display = "none";
      return;
    }
    const l = this.element.dataset.variation, d = parseInt(l || ""), y = !l || isNaN(d) ? 1 : d;
    this.currentMode = this.getVariationMode(y), this.mapContainerId = `rs-leaflet-map-${Date.now()}`, this.render(), this.subscribe("language", () => {
      this.updateLabelsInPlace();
    });
  }
  hasValidCoordinates() {
    const e = parseFloat(String(this.lat)), t = parseFloat(String(this.lng));
    return !isNaN(e) && !isNaN(t) && e !== 0 && t !== 0;
  }
  buildDisplayLocation() {
    return [
      this.locationName || this.municipality,
      this.province
    ].filter(Boolean).join(", ");
  }
  getVariationMode(e) {
    switch (e) {
      case 0:
        return this.hasCoords ? "pinpoint" : this.zipcode ? "zipcode" : "municipality";
      case 2:
        return this.hasCoords ? "pinpoint" : "municipality";
      case 3:
        return this.zipcode ? "zipcode" : "municipality";
      case 1:
      default:
        return "municipality";
    }
  }
  render() {
    if (this.hasInitiallyRendered) {
      this.updateLabelsInPlace();
      return;
    }
    this.hasInitiallyRendered = !0, this.element.classList.add("rs-detail-map");
    const e = this.buildDirectionsUrl(), t = this.buildLargerMapUrl(), i = e || t ? `
      <div class="rs-detail-map__actions">
        ${t ? `
          <a href="${t}" target="_blank" rel="noopener noreferrer" class="rs-detail-map__action">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
            </svg>
            ${this.label("detail_view_larger_map") || "View Larger Map"}
          </a>
        ` : ""}
        ${e ? `
          <a href="${e}" target="_blank" rel="noopener noreferrer" class="rs-detail-map__action">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 11l19-9-9 19-2-8-8-2z"/>
            </svg>
            ${this.label("detail_get_directions") || "Get Directions"}
          </a>
        ` : ""}
      </div>
    ` : "";
    this.element.innerHTML = `
      <div class="rs-detail-map__header">
        <h3 class="rs-detail-map__title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          ${this.label("detail_location") || "Location"}
        </h3>
        ${this.displayLocation ? `<p class="rs-detail-map__address">${this.displayLocation}</p>` : ""}
      </div>
      <div class="rs-detail-map__container rs-detail-map__container--fullwidth">
        <div class="rs-detail-map__loading" id="${this.mapContainerId}-loading">
          <div class="rs-detail-map__spinner"></div>
          <p>${this.label("detail_loading_map") || "Loading map..."}</p>
        </div>
        <div class="rs-detail-map__leaflet" id="${this.mapContainerId}"></div>
      </div>
      ${i}
    `, this.loadLeafletAndInit();
  }
  /**
   * Dynamically load Leaflet CSS + JS from CDN, then initialize the map
   */
  async loadLeafletAndInit() {
    try {
      await this.loadLeaflet(), await this.initLeafletMap();
    } catch (e) {
      console.error("[RealtySoft] Map init failed:", e), this.fallbackToIframe();
    }
  }
  loadLeaflet() {
    return new Promise((e, t) => {
      if (window.L) {
        e();
        return;
      }
      if (!document.querySelector('link[href*="leaflet"]')) {
        const s = document.createElement("link");
        s.rel = "stylesheet", s.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css", s.crossOrigin = "", document.head.appendChild(s);
      }
      if (document.querySelector('script[src*="leaflet"]')) {
        const s = setInterval(() => {
          window.L && (clearInterval(s), e());
        }, 50);
        setTimeout(() => {
          clearInterval(s), t(new Error("Leaflet load timeout"));
        }, 1e4);
      } else {
        const s = document.createElement("script");
        s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js", s.crossOrigin = "", s.onload = () => e(), s.onerror = () => t(new Error("Failed to load Leaflet")), document.head.appendChild(s);
      }
    });
  }
  /**
   * Initialize Leaflet map based on current mode
   */
  async initLeafletMap() {
    const e = window.L;
    if (!e) return;
    const t = document.getElementById(this.mapContainerId), s = document.getElementById(`${this.mapContainerId}-loading`);
    if (!t) return;
    const i = e.map(t);
    if (e.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(i), this.currentMode === "pinpoint" && this.hasCoords) {
      const r = parseFloat(String(this.lat)), a = parseFloat(String(this.lng));
      i.setView([r, a], 14);
      const l = e.marker([r, a]).addTo(i);
      this.displayLocation && l.bindPopup(`<strong>${this.displayLocation}</strong>`).openPopup(), s && (s.style.display = "none");
    } else {
      const r = this.buildNominatimQuery();
      try {
        const l = await (await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&polygon_geojson=1&limit=1&q=${encodeURIComponent(r)}`,
          { headers: { Accept: "application/json" } }
        )).json();
        if (l && l.length > 0 && l[0].geojson) {
          const y = l[0].geojson, p = e.geoJSON(y, {
            style: () => ({
              color: "#0066cc",
              weight: 3,
              opacity: 0.8,
              fillColor: "#0066cc",
              fillOpacity: 0.1
            })
          });
          p.addTo(i);
          const S = p.getBounds();
          i.fitBounds(S, { padding: [30, 30] });
        } else if (l && l.length > 0) {
          const d = parseFloat(l[0].lat), y = parseFloat(l[0].lon);
          i.setView([d, y], 12), e.circleMarker([d, y], {
            radius: 8,
            color: "#0066cc",
            fillColor: "#0066cc",
            fillOpacity: 0.3,
            weight: 2
          }).addTo(i);
        } else
          this.setFallbackView(i);
      } catch (a) {
        console.warn("[RealtySoft] Nominatim boundary fetch failed:", a), this.setFallbackView(i);
      }
      s && (s.style.display = "none");
    }
    setTimeout(() => i.invalidateSize(), 200);
  }
  /**
   * Build query string for Nominatim search
   */
  buildNominatimQuery() {
    if (this.currentMode === "zipcode" && this.zipcode) {
      const t = [this.zipcode];
      return this.province && t.push(this.province), t.push(this.country), t.join(", ");
    }
    const e = [];
    return this.locationName ? (e.push(this.locationName), this.province && e.push(this.province)) : this.municipality ? (e.push(this.municipality), this.province && e.push(this.province)) : this.province && e.push(this.province), e.push(this.country), e.join(", ");
  }
  /**
   * Set a fallback map view when Nominatim returns no results
   */
  setFallbackView(e) {
    if (this.hasCoords) {
      const t = parseFloat(String(this.lat)), s = parseFloat(String(this.lng));
      e.setView([t, s], 12);
    } else
      e.setView([40, -3.7], 6);
  }
  /**
   * Fallback to Google Maps iframe if Leaflet fails to load
   */
  fallbackToIframe() {
    var l;
    const e = document.getElementById(this.mapContainerId), t = document.getElementById(`${this.mapContainerId}-loading`);
    if (!e) return;
    const s = [];
    (this.locationName || this.municipality) && s.push(this.locationName || this.municipality), this.province && s.push(this.province), s.push(this.country);
    const i = s.join(", "), r = `https://maps.google.com/maps?q=${encodeURIComponent(i)}&z=12&output=embed`;
    e.style.display = "none";
    const a = document.createElement("iframe");
    a.className = "rs-detail-map__iframe", a.src = r, a.loading = "lazy", a.allowFullscreen = !0, a.referrerPolicy = "no-referrer-when-downgrade", a.onload = () => {
      t && (t.style.display = "none");
    }, (l = e.parentElement) == null || l.appendChild(a);
  }
  /**
   * Build Google Maps directions URL
   */
  buildDirectionsUrl() {
    let e = "";
    return this.currentMode === "pinpoint" && this.hasCoords ? e = `${this.lat},${this.lng}` : e = [
      this.locationName || this.municipality,
      this.province,
      this.country
    ].filter(Boolean).join(", "), e ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(e)}` : null;
  }
  /**
   * Build "View Larger Map" URL
   */
  buildLargerMapUrl() {
    if (this.currentMode === "pinpoint" && this.hasCoords)
      return `https://www.google.com/maps?q=${this.lat},${this.lng}&z=15`;
    let e = "";
    return this.zipcode ? e = [this.zipcode, this.locationName || this.municipality, this.province].filter(Boolean).join(" ") : e = [this.locationName || this.municipality, this.province, this.country].filter(Boolean).join(" "), e ? `https://www.google.com/maps/search/${encodeURIComponent(e)}` : null;
  }
  /**
   * Update only label text nodes on language change (preserves map itself)
   */
  updateLabelsInPlace() {
    const e = this.element.querySelector(".rs-detail-map__title");
    if (e) {
      const i = e.querySelector("svg");
      i && (e.innerHTML = "", e.appendChild(i), e.appendChild(document.createTextNode(" " + (this.label("detail_location") || "Location"))));
    }
    const t = this.element.querySelector(".rs-detail-map__loading p");
    t && (t.textContent = this.label("detail_loading_map") || "Loading map..."), this.element.querySelectorAll(".rs-detail-map__action").forEach((i, r) => {
      const a = i.querySelector("svg");
      if (a) {
        const l = r === 0 ? "detail_view_larger_map" : "detail_get_directions", d = r === 0 ? "View Larger Map" : "Get Directions";
        i.innerHTML = "", i.appendChild(a), i.appendChild(document.createTextNode(" " + (this.label(l) || d)));
      }
    });
  }
  getMapMode() {
    return this.currentMode;
  }
  isExactLocation() {
    return this.currentMode === "pinpoint" && this.hasCoords;
  }
}
class qe extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "property", null);
    o(this, "submitting", !1);
    o(this, "submitted", !1);
    o(this, "hasInitiallyRendered", !1);
    o(this, "lastDefaultMessage", "");
    o(this, "countryCodes", []);
    o(this, "popularCountries", []);
    o(this, "form", null);
    o(this, "submitBtn", null);
    o(this, "submitText", null);
    o(this, "submitLoader", null);
    o(this, "errorDiv", null);
    o(this, "successDiv", null);
    o(this, "countryBtn", null);
    o(this, "countryDropdown", null);
    o(this, "countryCodeInput", null);
    o(this, "countrySearch", null);
    o(this, "countryList", null);
    o(this, "thankYouMessage", "");
    o(this, "thankYouRedirect", null);
    this.init();
  }
  init() {
    var e;
    if (this.property = (e = this.options) == null ? void 0 : e.property, !this.property) {
      console.warn("[RealtySoft] Inquiry form: No property data available");
      return;
    }
    this.submitting = !1, this.submitted = !1, this.countryCodes = [
      { code: "+93", country: "AF", flag: "🇦🇫", name: "Afghanistan" },
      { code: "+355", country: "AL", flag: "🇦🇱", name: "Albania" },
      { code: "+213", country: "DZ", flag: "🇩🇿", name: "Algeria" },
      { code: "+376", country: "AD", flag: "🇦🇩", name: "Andorra" },
      { code: "+244", country: "AO", flag: "🇦🇴", name: "Angola" },
      { code: "+54", country: "AR", flag: "🇦🇷", name: "Argentina" },
      { code: "+374", country: "AM", flag: "🇦🇲", name: "Armenia" },
      { code: "+61", country: "AU", flag: "🇦🇺", name: "Australia" },
      { code: "+43", country: "AT", flag: "🇦🇹", name: "Austria" },
      { code: "+994", country: "AZ", flag: "🇦🇿", name: "Azerbaijan" },
      { code: "+973", country: "BH", flag: "🇧🇭", name: "Bahrain" },
      { code: "+880", country: "BD", flag: "🇧🇩", name: "Bangladesh" },
      { code: "+375", country: "BY", flag: "🇧🇾", name: "Belarus" },
      { code: "+32", country: "BE", flag: "🇧🇪", name: "Belgium" },
      { code: "+501", country: "BZ", flag: "🇧🇿", name: "Belize" },
      { code: "+229", country: "BJ", flag: "🇧🇯", name: "Benin" },
      { code: "+975", country: "BT", flag: "🇧🇹", name: "Bhutan" },
      { code: "+591", country: "BO", flag: "🇧🇴", name: "Bolivia" },
      { code: "+387", country: "BA", flag: "🇧🇦", name: "Bosnia" },
      { code: "+267", country: "BW", flag: "🇧🇼", name: "Botswana" },
      { code: "+55", country: "BR", flag: "🇧🇷", name: "Brazil" },
      { code: "+673", country: "BN", flag: "🇧🇳", name: "Brunei" },
      { code: "+359", country: "BG", flag: "🇧🇬", name: "Bulgaria" },
      { code: "+855", country: "KH", flag: "🇰🇭", name: "Cambodia" },
      { code: "+237", country: "CM", flag: "🇨🇲", name: "Cameroon" },
      { code: "+1", country: "CA", flag: "🇨🇦", name: "Canada" },
      { code: "+56", country: "CL", flag: "🇨🇱", name: "Chile" },
      { code: "+86", country: "CN", flag: "🇨🇳", name: "China" },
      { code: "+57", country: "CO", flag: "🇨🇴", name: "Colombia" },
      { code: "+506", country: "CR", flag: "🇨🇷", name: "Costa Rica" },
      { code: "+385", country: "HR", flag: "🇭🇷", name: "Croatia" },
      { code: "+53", country: "CU", flag: "🇨🇺", name: "Cuba" },
      { code: "+357", country: "CY", flag: "🇨🇾", name: "Cyprus" },
      { code: "+420", country: "CZ", flag: "🇨🇿", name: "Czech Republic" },
      { code: "+45", country: "DK", flag: "🇩🇰", name: "Denmark" },
      { code: "+253", country: "DJ", flag: "🇩🇯", name: "Djibouti" },
      { code: "+593", country: "EC", flag: "🇪🇨", name: "Ecuador" },
      { code: "+20", country: "EG", flag: "🇪🇬", name: "Egypt" },
      { code: "+503", country: "SV", flag: "🇸🇻", name: "El Salvador" },
      { code: "+372", country: "EE", flag: "🇪🇪", name: "Estonia" },
      { code: "+251", country: "ET", flag: "🇪🇹", name: "Ethiopia" },
      { code: "+679", country: "FJ", flag: "🇫🇯", name: "Fiji" },
      { code: "+358", country: "FI", flag: "🇫🇮", name: "Finland" },
      { code: "+33", country: "FR", flag: "🇫🇷", name: "France" },
      { code: "+995", country: "GE", flag: "🇬🇪", name: "Georgia" },
      { code: "+49", country: "DE", flag: "🇩🇪", name: "Germany" },
      { code: "+233", country: "GH", flag: "🇬🇭", name: "Ghana" },
      { code: "+30", country: "GR", flag: "🇬🇷", name: "Greece" },
      { code: "+502", country: "GT", flag: "🇬🇹", name: "Guatemala" },
      { code: "+504", country: "HN", flag: "🇭🇳", name: "Honduras" },
      { code: "+852", country: "HK", flag: "🇭🇰", name: "Hong Kong" },
      { code: "+36", country: "HU", flag: "🇭🇺", name: "Hungary" },
      { code: "+354", country: "IS", flag: "🇮🇸", name: "Iceland" },
      { code: "+91", country: "IN", flag: "🇮🇳", name: "India" },
      { code: "+62", country: "ID", flag: "🇮🇩", name: "Indonesia" },
      { code: "+98", country: "IR", flag: "🇮🇷", name: "Iran" },
      { code: "+964", country: "IQ", flag: "🇮🇶", name: "Iraq" },
      { code: "+353", country: "IE", flag: "🇮🇪", name: "Ireland" },
      { code: "+972", country: "IL", flag: "🇮🇱", name: "Israel" },
      { code: "+39", country: "IT", flag: "🇮🇹", name: "Italy" },
      { code: "+1876", country: "JM", flag: "🇯🇲", name: "Jamaica" },
      { code: "+81", country: "JP", flag: "🇯🇵", name: "Japan" },
      { code: "+962", country: "JO", flag: "🇯🇴", name: "Jordan" },
      { code: "+7", country: "KZ", flag: "🇰🇿", name: "Kazakhstan" },
      { code: "+254", country: "KE", flag: "🇰🇪", name: "Kenya" },
      { code: "+965", country: "KW", flag: "🇰🇼", name: "Kuwait" },
      { code: "+996", country: "KG", flag: "🇰🇬", name: "Kyrgyzstan" },
      { code: "+856", country: "LA", flag: "🇱🇦", name: "Laos" },
      { code: "+371", country: "LV", flag: "🇱🇻", name: "Latvia" },
      { code: "+961", country: "LB", flag: "🇱🇧", name: "Lebanon" },
      { code: "+218", country: "LY", flag: "🇱🇾", name: "Libya" },
      { code: "+423", country: "LI", flag: "🇱🇮", name: "Liechtenstein" },
      { code: "+370", country: "LT", flag: "🇱🇹", name: "Lithuania" },
      { code: "+352", country: "LU", flag: "🇱🇺", name: "Luxembourg" },
      { code: "+853", country: "MO", flag: "🇲🇴", name: "Macau" },
      { code: "+60", country: "MY", flag: "🇲🇾", name: "Malaysia" },
      { code: "+960", country: "MV", flag: "🇲🇻", name: "Maldives" },
      { code: "+356", country: "MT", flag: "🇲🇹", name: "Malta" },
      { code: "+230", country: "MU", flag: "🇲🇺", name: "Mauritius" },
      { code: "+52", country: "MX", flag: "🇲🇽", name: "Mexico" },
      { code: "+373", country: "MD", flag: "🇲🇩", name: "Moldova" },
      { code: "+377", country: "MC", flag: "🇲🇨", name: "Monaco" },
      { code: "+976", country: "MN", flag: "🇲🇳", name: "Mongolia" },
      { code: "+382", country: "ME", flag: "🇲🇪", name: "Montenegro" },
      { code: "+212", country: "MA", flag: "🇲🇦", name: "Morocco" },
      { code: "+258", country: "MZ", flag: "🇲🇿", name: "Mozambique" },
      { code: "+95", country: "MM", flag: "🇲🇲", name: "Myanmar" },
      { code: "+264", country: "NA", flag: "🇳🇦", name: "Namibia" },
      { code: "+977", country: "NP", flag: "🇳🇵", name: "Nepal" },
      { code: "+31", country: "NL", flag: "🇳🇱", name: "Netherlands" },
      { code: "+64", country: "NZ", flag: "🇳🇿", name: "New Zealand" },
      { code: "+505", country: "NI", flag: "🇳🇮", name: "Nicaragua" },
      { code: "+234", country: "NG", flag: "🇳🇬", name: "Nigeria" },
      { code: "+389", country: "MK", flag: "🇲🇰", name: "North Macedonia" },
      { code: "+47", country: "NO", flag: "🇳🇴", name: "Norway" },
      { code: "+968", country: "OM", flag: "🇴🇲", name: "Oman" },
      { code: "+92", country: "PK", flag: "🇵🇰", name: "Pakistan" },
      { code: "+507", country: "PA", flag: "🇵🇦", name: "Panama" },
      { code: "+595", country: "PY", flag: "🇵🇾", name: "Paraguay" },
      { code: "+51", country: "PE", flag: "🇵🇪", name: "Peru" },
      { code: "+63", country: "PH", flag: "🇵🇭", name: "Philippines" },
      { code: "+48", country: "PL", flag: "🇵🇱", name: "Poland" },
      { code: "+351", country: "PT", flag: "🇵🇹", name: "Portugal" },
      { code: "+1787", country: "PR", flag: "🇵🇷", name: "Puerto Rico" },
      { code: "+974", country: "QA", flag: "🇶🇦", name: "Qatar" },
      { code: "+40", country: "RO", flag: "🇷🇴", name: "Romania" },
      { code: "+7", country: "RU", flag: "🇷🇺", name: "Russia" },
      { code: "+966", country: "SA", flag: "🇸🇦", name: "Saudi Arabia" },
      { code: "+221", country: "SN", flag: "🇸🇳", name: "Senegal" },
      { code: "+381", country: "RS", flag: "🇷🇸", name: "Serbia" },
      { code: "+65", country: "SG", flag: "🇸🇬", name: "Singapore" },
      { code: "+421", country: "SK", flag: "🇸🇰", name: "Slovakia" },
      { code: "+386", country: "SI", flag: "🇸🇮", name: "Slovenia" },
      { code: "+27", country: "ZA", flag: "🇿🇦", name: "South Africa" },
      { code: "+82", country: "KR", flag: "🇰🇷", name: "South Korea" },
      { code: "+34", country: "ES", flag: "🇪🇸", name: "Spain" },
      { code: "+94", country: "LK", flag: "🇱🇰", name: "Sri Lanka" },
      { code: "+46", country: "SE", flag: "🇸🇪", name: "Sweden" },
      { code: "+41", country: "CH", flag: "🇨🇭", name: "Switzerland" },
      { code: "+886", country: "TW", flag: "🇹🇼", name: "Taiwan" },
      { code: "+992", country: "TJ", flag: "🇹🇯", name: "Tajikistan" },
      { code: "+255", country: "TZ", flag: "🇹🇿", name: "Tanzania" },
      { code: "+66", country: "TH", flag: "🇹🇭", name: "Thailand" },
      { code: "+216", country: "TN", flag: "🇹🇳", name: "Tunisia" },
      { code: "+90", country: "TR", flag: "🇹🇷", name: "Turkey" },
      { code: "+993", country: "TM", flag: "🇹🇲", name: "Turkmenistan" },
      { code: "+256", country: "UG", flag: "🇺🇬", name: "Uganda" },
      { code: "+380", country: "UA", flag: "🇺🇦", name: "Ukraine" },
      { code: "+971", country: "AE", flag: "🇦🇪", name: "UAE" },
      { code: "+44", country: "GB", flag: "🇬🇧", name: "United Kingdom" },
      { code: "+1", country: "US", flag: "🇺🇸", name: "United States" },
      { code: "+598", country: "UY", flag: "🇺🇾", name: "Uruguay" },
      { code: "+998", country: "UZ", flag: "🇺🇿", name: "Uzbekistan" },
      { code: "+58", country: "VE", flag: "🇻🇪", name: "Venezuela" },
      { code: "+84", country: "VN", flag: "🇻🇳", name: "Vietnam" },
      { code: "+967", country: "YE", flag: "🇾🇪", name: "Yemen" },
      { code: "+260", country: "ZM", flag: "🇿🇲", name: "Zambia" },
      { code: "+263", country: "ZW", flag: "🇿🇼", name: "Zimbabwe" }
    ], this.popularCountries = ["ES", "GB", "DE", "FR", "NL", "BE", "US", "AE", "CH", "SE"], this.render(), this.bindEvents(), this.detectCountry(), this.subscribe("language", () => {
      this.updateLabelsInPlace();
    });
  }
  /**
   * Auto-detect user's country from browser timezone
   */
  detectCountry() {
    if (!this.countryBtn || !this.countryCodeInput) return;
    const e = Intl.DateTimeFormat().resolvedOptions().timeZone, s = {
      "Europe/Madrid": "+34",
      "Europe/London": "+44",
      "Europe/Berlin": "+49",
      "Europe/Paris": "+33",
      "Europe/Amsterdam": "+31",
      "Europe/Brussels": "+32",
      "Europe/Stockholm": "+46",
      "Europe/Oslo": "+47",
      "Europe/Copenhagen": "+45",
      "Europe/Helsinki": "+358",
      "Europe/Zurich": "+41",
      "Europe/Vienna": "+43",
      "Europe/Rome": "+39",
      "Europe/Lisbon": "+351",
      "Europe/Dublin": "+353",
      "Europe/Warsaw": "+48",
      "Europe/Prague": "+420",
      "Europe/Athens": "+30",
      "Europe/Moscow": "+7",
      "America/New_York": "+1",
      "America/Los_Angeles": "+1",
      "America/Chicago": "+1",
      "America/Toronto": "+1",
      "America/Mexico_City": "+52",
      "America/Sao_Paulo": "+55",
      "Asia/Dubai": "+971",
      "Asia/Riyadh": "+966",
      "Asia/Shanghai": "+86",
      "Asia/Tokyo": "+81",
      "Asia/Singapore": "+65",
      "Asia/Hong_Kong": "+852",
      "Asia/Kolkata": "+91",
      "Australia/Sydney": "+61",
      "Pacific/Auckland": "+64",
      "Africa/Johannesburg": "+27"
    }[e];
    if (s) {
      const i = this.countryCodes.find((r) => r.code === s);
      i && this.setCountry(i);
    }
  }
  /**
   * Set the selected country
   */
  setCountry(e) {
    if (!this.countryCodeInput || !this.countryBtn) return;
    this.countryCodeInput.value = e.code;
    const t = this.countryBtn.querySelector(".rs-detail-inquiry__country-flag"), s = this.countryBtn.querySelector(".rs-detail-inquiry__country-code");
    t && (t.textContent = e.flag), s && (s.textContent = e.code);
  }
  render() {
    if (this.hasInitiallyRendered) {
      this.updateLabelsInPlace();
      return;
    }
    this.hasInitiallyRendered = !0, this.element.classList.add("rs-detail-inquiry");
    const e = RealtySoftState.get("config") || {}, t = e.privacyPolicyUrl || "/privacy", s = e.defaultCountryCode || "+34";
    this.thankYouMessage = e.inquiryThankYouMessage || this.label("inquiry_success"), this.thankYouRedirect = e.inquiryThankYouUrl || null, this.element.innerHTML = `
      <h3 class="rs-detail-inquiry__title">${this.label("detail_contact")}</h3>
      <form class="rs-detail-inquiry__form">
        <div class="rs-detail-inquiry__row">
          <div class="rs-detail-inquiry__field rs-detail-inquiry__field--half">
            <label class="rs-detail-inquiry__label" for="rs-inquiry-firstname">${this.label("inquiry_first_name")} *</label>
            <input type="text"
                   id="rs-inquiry-firstname"
                   name="first_name"
                   class="rs-detail-inquiry__input"
                   autocomplete="given-name"
                   required>
          </div>

          <div class="rs-detail-inquiry__field rs-detail-inquiry__field--half">
            <label class="rs-detail-inquiry__label" for="rs-inquiry-lastname">${this.label("inquiry_last_name")} *</label>
            <input type="text"
                   id="rs-inquiry-lastname"
                   name="last_name"
                   class="rs-detail-inquiry__input"
                   autocomplete="family-name"
                   required>
          </div>
        </div>

        <div class="rs-detail-inquiry__field">
          <label class="rs-detail-inquiry__label" for="rs-inquiry-email">${this.label("inquiry_email")} *</label>
          <input type="email"
                 id="rs-inquiry-email"
                 name="email"
                 class="rs-detail-inquiry__input"
                 autocomplete="email"
                 required>
        </div>

        <div class="rs-detail-inquiry__field">
          <label class="rs-detail-inquiry__label" for="rs-inquiry-phone">${this.label("inquiry_phone")}</label>
          <div class="rs-detail-inquiry__phone-group">
            <div class="rs-detail-inquiry__country-select">
              <button type="button" class="rs-detail-inquiry__country-btn">
                <span class="rs-detail-inquiry__country-flag">${this.getFlag(s)}</span>
                <span class="rs-detail-inquiry__country-code">${s}</span>
                <svg class="rs-detail-inquiry__country-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <input type="hidden" name="country_code" value="${s}">
              <div class="rs-detail-inquiry__country-dropdown" style="display: none;">
                <div class="rs-detail-inquiry__country-search">
                  <input type="text"
                         class="rs-detail-inquiry__country-search-input"
                         placeholder="Search country...">
                </div>
                <div class="rs-detail-inquiry__country-list">
                  ${this.renderCountryOptions()}
                </div>
              </div>
            </div>
            <input type="tel"
                   id="rs-inquiry-phone"
                   name="phone"
                   class="rs-detail-inquiry__input rs-detail-inquiry__input--phone"
                   autocomplete="tel-national"
                   placeholder="600 000 000">
          </div>
        </div>

        <div class="rs-detail-inquiry__field">
          <label class="rs-detail-inquiry__label" for="rs-inquiry-message">${this.label("inquiry_message")} *</label>
          <textarea id="rs-inquiry-message"
                    name="message"
                    class="rs-detail-inquiry__textarea"
                    rows="4"
                    required>${this.getDefaultMessage()}</textarea>
        </div>

        <div class="rs-detail-inquiry__field rs-detail-inquiry__field--checkbox">
          <label class="rs-detail-inquiry__checkbox-label">
            <input type="checkbox"
                   name="privacy"
                   class="rs-detail-inquiry__checkbox"
                   required>
            <span class="rs-detail-inquiry__checkbox-text">
              ${this.label("inquiry_privacy_accept")}
              <a href="${t}" target="_blank" rel="noopener">${this.label("inquiry_privacy_policy")}</a>
            </span>
          </label>
        </div>

        <div class="rs-detail-inquiry__error" style="display: none;"></div>

        <button type="submit" class="rs-detail-inquiry__submit">
          <span class="rs-detail-inquiry__submit-text">${this.label("inquiry_submit")}</span>
          <span class="rs-detail-inquiry__submit-loader" style="display: none;">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-dasharray="31.4 31.4">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
              </circle>
            </svg>
          </span>
        </button>
      </form>
      <div class="rs-detail-inquiry__success" style="display: none;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span class="rs-detail-inquiry__success-message">${this.thankYouMessage}</span>
      </div>
    `, this.form = this.element.querySelector(".rs-detail-inquiry__form"), this.submitBtn = this.element.querySelector(".rs-detail-inquiry__submit"), this.submitText = this.element.querySelector(".rs-detail-inquiry__submit-text"), this.submitLoader = this.element.querySelector(".rs-detail-inquiry__submit-loader"), this.errorDiv = this.element.querySelector(".rs-detail-inquiry__error"), this.successDiv = this.element.querySelector(".rs-detail-inquiry__success"), this.countryBtn = this.element.querySelector(".rs-detail-inquiry__country-btn"), this.countryDropdown = this.element.querySelector(".rs-detail-inquiry__country-dropdown"), this.countryCodeInput = this.element.querySelector('input[name="country_code"]'), this.countrySearch = this.element.querySelector(".rs-detail-inquiry__country-search-input"), this.countryList = this.element.querySelector(".rs-detail-inquiry__country-list"), this.lastDefaultMessage = this.getDefaultMessage();
  }
  /**
   * Render country options with popular countries at top
   */
  renderCountryOptions(e = "") {
    const t = e.toLowerCase(), s = this.popularCountries.map((p) => this.countryCodes.find((S) => S.country === p)).filter((p) => !!p), i = this.countryCodes.filter((p) => !this.popularCountries.includes(p.country)), r = (p) => e ? p.name.toLowerCase().includes(t) || p.code.includes(e) || p.country.toLowerCase().includes(t) : !0, a = s.filter(r), l = i.filter(r);
    let d = "";
    a.length > 0 && !e && (d += `<div class="rs-detail-inquiry__country-section">
        <div class="rs-detail-inquiry__country-section-title">Popular</div>
        ${a.map((p) => this.renderCountryOption(p)).join("")}
      </div>`);
    const y = e ? [...a, ...l] : l;
    return y.length > 0 && (e ? d += y.map((p) => this.renderCountryOption(p)).join("") : d += `<div class="rs-detail-inquiry__country-section">
          <div class="rs-detail-inquiry__country-section-title">All Countries</div>
          ${y.map((p) => this.renderCountryOption(p)).join("")}
        </div>`), d || (d = '<div class="rs-detail-inquiry__country-empty">No country found</div>'), d;
  }
  renderCountryOption(e) {
    return `<button type="button"
                    class="rs-detail-inquiry__country-option"
                    data-code="${e.code}"
                    data-flag="${e.flag}"
                    data-country="${e.country}">
                <span class="rs-detail-inquiry__country-flag">${e.flag}</span>
                <span class="rs-detail-inquiry__country-name">${e.name}</span>
                <span class="rs-detail-inquiry__country-code">${e.code}</span>
            </button>`;
  }
  getFlag(e) {
    const t = this.countryCodes.find((s) => s.code === e);
    return t ? t.flag : "🌍";
  }
  getDefaultMessage() {
    const e = this.property;
    if (!e) return "";
    const t = e.title || "this property", s = e.ref ? ` (Ref: ${e.ref})` : "", i = "inquiry_default_message", r = this.label(i);
    return (r && r !== i && !r.includes("{%") ? r : 'I am interested in the property "{title}"{ref}. Please contact me with more information.').replace("{title}", t).replace("{ref}", s);
  }
  bindEvents() {
    var e, t, s;
    this.form && this.form.addEventListener("submit", async (i) => {
      i.preventDefault(), !(this.submitting || this.submitted) && await this.submitForm();
    }), (e = this.countryBtn) == null || e.addEventListener("click", (i) => {
      if (i.stopPropagation(), !this.countryDropdown) return;
      this.countryDropdown.style.display !== "none" ? this.closeCountryDropdown() : this.openCountryDropdown();
    }), (t = this.countrySearch) == null || t.addEventListener("input", (i) => {
      const a = i.target.value.trim();
      this.countryList && (this.countryList.innerHTML = this.renderCountryOptions(a), this.bindCountryOptions());
    }), (s = this.countryDropdown) == null || s.addEventListener("click", (i) => {
      i.stopPropagation();
    }), this.bindCountryOptions(), document.addEventListener("click", () => {
      this.closeCountryDropdown();
    });
  }
  openCountryDropdown() {
    this.countryDropdown && (this.countryDropdown.style.display = "block", this.countrySearch && this.countryList && (this.countrySearch.value = "", this.countryList.innerHTML = this.renderCountryOptions(""), this.bindCountryOptions(), setTimeout(() => this.countrySearch.focus(), 10)));
  }
  closeCountryDropdown() {
    this.countryDropdown && (this.countryDropdown.style.display = "none");
  }
  bindCountryOptions() {
    var e;
    (e = this.countryList) == null || e.querySelectorAll(".rs-detail-inquiry__country-option").forEach((t) => {
      t.addEventListener("click", () => {
        const s = t.dataset.code || "", i = t.dataset.flag || "";
        if (this.countryCodeInput && (this.countryCodeInput.value = s), this.countryBtn) {
          const r = this.countryBtn.querySelector(".rs-detail-inquiry__country-flag"), a = this.countryBtn.querySelector(".rs-detail-inquiry__country-code");
          r && (r.textContent = i), a && (a.textContent = s);
        }
        this.closeCountryDropdown();
      });
    });
  }
  async submitForm() {
    var l;
    if (!this.form || !this.property) return;
    this.submitting = !0, this.showLoading(), this.hideError();
    const e = new FormData(this.form), t = e.get("country_code") || "", s = e.get("phone") || "", i = RealtySoftState.get("config") || {}, r = i.ownerEmail || ((l = this.property.agent) == null ? void 0 : l.email) || "", a = {
      firstName: e.get("first_name"),
      lastName: e.get("last_name"),
      email: e.get("email"),
      phone: s,
      countryCode: t,
      message: e.get("message"),
      propertyId: this.property.id,
      propertyRef: this.property.ref,
      propertyTitle: this.property.title,
      propertyUrl: window.location.href,
      propertyPrice: this.property.price ? RealtySoftLabels.formatPrice(this.property.price) : "",
      ownerEmail: r,
      sendConfirmation: i.sendConfirmationEmail !== !1,
      language: RealtySoftLabels.getLanguage(),
      privacyAccepted: !0
    };
    try {
      await RealtySoftAPI.submitInquiry(a), this.submitted = !0, this.showSuccess(), this.form.reset(), RealtySoftAnalytics.trackInquiry(this.property.id, this.property.ref);
    } catch (d) {
      console.error("Inquiry submission failed:", d);
      const y = d.message || this.label("inquiry_error");
      this.showError(y);
    } finally {
      this.submitting = !1, this.hideLoading();
    }
  }
  showLoading() {
    this.submitBtn && (this.submitBtn.disabled = !0), this.submitText && (this.submitText.style.display = "none"), this.submitLoader && (this.submitLoader.style.display = "inline-block");
  }
  hideLoading() {
    this.submitBtn && (this.submitBtn.disabled = !1), this.submitText && (this.submitText.style.display = "inline"), this.submitLoader && (this.submitLoader.style.display = "none");
  }
  showError(e) {
    this.errorDiv && (this.errorDiv.textContent = e, this.errorDiv.style.display = "block");
  }
  hideError() {
    this.errorDiv && (this.errorDiv.style.display = "none");
  }
  showSuccess() {
    this.form && (this.form.style.display = "none"), this.successDiv && (this.successDiv.style.display = "flex"), this.thankYouRedirect && setTimeout(() => {
      window.location.href = this.thankYouRedirect;
    }, 1e3);
  }
  /**
   * Update only label text nodes on language change (preserves form state)
   */
  updateLabelsInPlace() {
    var r;
    if (this.submitted) return;
    const e = this.element.querySelector(".rs-detail-inquiry__title");
    e && (e.textContent = this.label("detail_contact"));
    const t = {
      "rs-inquiry-firstname": "inquiry_first_name",
      "rs-inquiry-lastname": "inquiry_last_name",
      "rs-inquiry-email": "inquiry_email",
      "rs-inquiry-phone": "inquiry_phone",
      "rs-inquiry-message": "inquiry_message"
    };
    for (const [a, l] of Object.entries(t)) {
      const d = this.element.querySelector(`label[for="${a}"]`);
      if (d) {
        const y = (r = d.textContent) == null ? void 0 : r.includes("*");
        d.textContent = this.label(l) + (y ? " *" : "");
      }
    }
    this.submitText && (this.submitText.textContent = this.label("inquiry_submit"));
    const s = this.element.querySelector(".rs-detail-inquiry__checkbox-text");
    if (s) {
      const a = s.querySelector("a");
      if (a) {
        a.textContent = this.label("inquiry_privacy_policy");
        const l = s.firstChild;
        l && l.nodeType === Node.TEXT_NODE && (l.textContent = this.label("inquiry_privacy_accept") + " ");
      }
    }
    const i = this.element.querySelector("#rs-inquiry-message");
    if (i) {
      const a = i.value.trim(), l = this.lastDefaultMessage.trim();
      if (a === l || a === "") {
        const d = this.getDefaultMessage();
        i.value = d, this.lastDefaultMessage = d;
      }
    }
  }
}
class ze extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "property", null);
    o(this, "isInWishlist", !1);
    o(this, "btn", null);
    o(this, "icon", null);
    o(this, "text", null);
    this.init();
  }
  init() {
    var t;
    if (this.property = (t = this.options) == null ? void 0 : t.property, !this.property || !this.property.id) {
      this.element.style.display = "none";
      return;
    }
    const e = this.property.ref || this.property.id;
    this.isInWishlist = typeof WishlistManager < "u" && WishlistManager ? WishlistManager.has(e) : RealtySoftState.isInWishlist(this.property.id), this.render(), this.bindEvents(), window.addEventListener("wishlistChanged", () => {
      const s = this.property.ref || this.property.id;
      this.isInWishlist = typeof WishlistManager < "u" && WishlistManager ? WishlistManager.has(s) : RealtySoftState.isInWishlist(this.property.id), this.updateDisplay();
    }), this.subscribe("wishlist", () => {
      const s = this.property.ref || this.property.id;
      this.isInWishlist = typeof WishlistManager < "u" && WishlistManager ? WishlistManager.has(s) : RealtySoftState.isInWishlist(this.property.id), this.updateDisplay();
    }), this.subscribe("language", () => {
      this.updateDisplay();
    });
  }
  render() {
    this.element.classList.add("rs-detail-wishlist"), this.element.innerHTML = `
      <button type="button" class="rs-detail-wishlist__btn ${this.isInWishlist ? "rs-detail-wishlist__btn--active" : ""}">
        <svg class="rs-detail-wishlist__icon" width="20" height="20" viewBox="0 0 24 24"
             fill="${this.isInWishlist ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
        <span class="rs-detail-wishlist__text">
          ${this.isInWishlist ? this.label("wishlist_remove") : this.label("wishlist_add")}
        </span>
      </button>
    `, this.btn = this.element.querySelector(".rs-detail-wishlist__btn"), this.icon = this.element.querySelector(".rs-detail-wishlist__icon"), this.text = this.element.querySelector(".rs-detail-wishlist__text");
  }
  bindEvents() {
    this.btn && this.btn.addEventListener("click", () => {
      this.toggleWishlist();
    });
  }
  toggleWishlist() {
    try {
      const e = this.property, t = e.ref || e.id, s = typeof WishlistManager < "u" && WishlistManager;
      if (this.isInWishlist) {
        s && WishlistManager.remove(t);
        try {
          RealtySoftState.removeFromWishlist(e.id);
        } catch {
        }
        try {
          RealtySoftAnalytics.trackWishlistRemove(e.id);
        } catch {
        }
        typeof RealtySoftToast < "u" && RealtySoftToast && RealtySoftToast.success(this.label("wishlist_removed") || "Removed from wishlist");
      } else {
        s && WishlistManager.add({
          id: e.id,
          ref_no: e.ref,
          ref: e.ref,
          name: e.title,
          title: e.title,
          list_price: e.price,
          price: e.price,
          location: e.location,
          type: e.type,
          bedrooms: e.beds,
          beds: e.beds,
          bathrooms: e.baths,
          baths: e.baths,
          built_area: e.built_area,
          plot_size: e.plot_size,
          images: e.images || [],
          listing_type: e.listing_type || e.status,
          is_featured: e.is_featured || !1
        });
        try {
          RealtySoftState.addToWishlist(e.id);
        } catch {
        }
        try {
          RealtySoftAnalytics.trackWishlistAdd(e.id);
        } catch {
        }
        typeof RealtySoftToast < "u" && RealtySoftToast && RealtySoftToast.success(this.label("wishlist_add") || "Added to wishlist!");
      }
    } catch (e) {
      console.error("[DetailWishlist] Toggle error:", e);
    }
  }
  updateDisplay() {
    this.btn && this.btn.classList.toggle("rs-detail-wishlist__btn--active", this.isInWishlist), this.icon && this.icon.setAttribute("fill", this.isInWishlist ? "currentColor" : "none"), this.text && (this.text.textContent = this.isInWishlist ? this.label("wishlist_remove") : this.label("wishlist_add"));
  }
}
class Be extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "property", null);
    o(this, "hasInitiallyRendered", !1);
    this.init();
  }
  init() {
    var e;
    if (this.property = (e = this.options) == null ? void 0 : e.property, !this.property) {
      this.element.style.display = "none";
      return;
    }
    this.render(), this.bindEvents(), this.subscribe("language", () => {
      this.updateLabelsInPlace();
    });
  }
  render() {
    if (this.hasInitiallyRendered) {
      this.updateLabelsInPlace();
      return;
    }
    this.hasInitiallyRendered = !0, this.element.classList.add("rs-detail-share"), this.element.innerHTML = `
      <span class="rs-detail-share__label">${this.label("detail_share") || "Share"}</span>
      <div class="rs-detail-share__buttons">
        <button type="button"
                class="rs-detail-share__btn rs-detail-share__btn--whatsapp"
                data-platform="whatsapp"
                title="WhatsApp">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </button>

        <button type="button"
                class="rs-detail-share__btn rs-detail-share__btn--facebook"
                data-platform="facebook"
                title="Facebook">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </button>

        <button type="button"
                class="rs-detail-share__btn rs-detail-share__btn--twitter"
                data-platform="twitter"
                title="Twitter/X">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </button>

        <button type="button"
                class="rs-detail-share__btn rs-detail-share__btn--linkedin"
                data-platform="linkedin"
                title="LinkedIn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </button>

        <button type="button"
                class="rs-detail-share__btn rs-detail-share__btn--email"
                data-platform="email"
                title="Email">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
        </button>

        <button type="button"
                class="rs-detail-share__btn rs-detail-share__btn--copy"
                data-platform="copy"
                title="Copy Link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
      </div>
    `;
  }
  bindEvents() {
    this.element.querySelectorAll(".rs-detail-share__btn").forEach((e) => {
      e.addEventListener("click", () => {
        const t = e.dataset.platform || "";
        t === "copy" ? this.copyToClipboard() : this.share(t), RealtySoftAnalytics.trackShare(t, this.property.id);
      });
    });
  }
  /**
   * Get the URL to share.
   * WordPress: shares window.location.href (OG tags served from transient cache).
   * Non-WordPress: shares a share.php URL on realtysoft.ai with property data as params.
   */
  getShareUrl() {
    return (window.RealtySoftConfig || {}).wpRestUrl ? window.location.href : this.buildSharePhpUrl();
  }
  /**
   * Build a share.php URL on realtysoft.ai with property data as query params.
   * Used as a fallback for non-WordPress platforms (Wix, Squarespace, etc.).
   */
  buildSharePhpUrl() {
    var s, i;
    const e = this.property, t = new URLSearchParams();
    return t.set("ref", e.ref || e.unique_ref || ""), t.set("title", e.title || ""), t.set("image", ((s = e.imagesFull) == null ? void 0 : s[0]) || ((i = e.images) == null ? void 0 : i[0]) || ""), t.set("description", (e.short_description || e.description || "").substring(0, 300)), t.set("price", RealtySoftLabels.formatPrice(e.price)), t.set("location", e.location || ""), t.set("url", window.location.href), `https://realtysoft.ai/propertymanager/share.php?${t.toString()}`;
  }
  /**
   * Share to specific platform.
   * Uses getShareUrl() to determine the correct URL based on platform.
   */
  share(e) {
    const t = this.property, s = this.getShareUrl(), i = encodeURIComponent(`${t.title} - ${RealtySoftLabels.formatPrice(t.price)}`);
    let r = "";
    switch (e) {
      case "whatsapp":
        r = `https://wa.me/?text=${encodeURIComponent(t.title + " - " + s)}`;
        break;
      case "facebook":
        r = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(s)}`;
        break;
      case "twitter":
        r = `https://twitter.com/intent/tweet?text=${i}&url=${encodeURIComponent(s)}`;
        break;
      case "linkedin":
        r = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(s)}`;
        break;
      case "email": {
        const a = encodeURIComponent(t.title || "Check out this property"), l = encodeURIComponent(`${t.title}
${RealtySoftLabels.formatPrice(t.price)}
${t.location || ""}

View property: ${s}`);
        r = `mailto:?subject=${a}&body=${l}`, window.location.href = r;
        return;
      }
      default:
        r = s;
    }
    window.open(r, "_blank", "width=600,height=500,scrollbars=yes");
  }
  async copyToClipboard() {
    const e = this.getShareUrl();
    try {
      await navigator.clipboard.writeText(e), this.showCopiedFeedback();
    } catch {
      const t = document.createElement("textarea");
      t.value = e, document.body.appendChild(t), t.select(), document.execCommand("copy"), document.body.removeChild(t), this.showCopiedFeedback();
    }
  }
  showCopiedFeedback() {
    const e = this.element.querySelector(".rs-detail-share__btn--copy");
    if (!e) return;
    const t = e.title;
    e.title = "Copied!", e.classList.add("rs-detail-share__btn--copied"), typeof RealtySoftToast < "u" && RealtySoftToast && RealtySoftToast.success("Link copied to clipboard!"), setTimeout(() => {
      e.title = t, e.classList.remove("rs-detail-share__btn--copied");
    }, 2e3);
  }
  /**
   * Update only label text nodes on language change
   */
  updateLabelsInPlace() {
    const e = this.element.querySelector(".rs-detail-share__label");
    e && (e.textContent = this.label("detail_share") || "Share");
  }
}
class De extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "property", null);
    o(this, "relatedProperties", []);
    o(this, "limit", 6);
    o(this, "loader", null);
    o(this, "grid", null);
    o(this, "hasInitiallyRendered", !1);
    this.init();
  }
  init() {
    var e;
    if (this.property = (e = this.options) == null ? void 0 : e.property, !this.property || !this.property.id) {
      this.element.style.display = "none";
      return;
    }
    this.relatedProperties = [], this.limit = parseInt(this.element.dataset.limit || "6") || 6, this.render(), this.loadRelated(), this.subscribe("language", () => {
      this.updateLabelsInPlace();
    });
  }
  render() {
    if (this.hasInitiallyRendered) {
      this.updateLabelsInPlace();
      return;
    }
    this.hasInitiallyRendered = !0, this.element.classList.add("rs-detail-related"), this.element.innerHTML = `
      <h3 class="rs-detail-related__title">${this.label("detail_related")}</h3>
      <div class="rs-detail-related__loader">
        <div class="rs-detail-related__spinner"></div>
      </div>
      <div class="rs-detail-related__grid"></div>
    `, this.loader = this.element.querySelector(".rs-detail-related__loader"), this.grid = this.element.querySelector(".rs-detail-related__grid");
  }
  /**
   * Update only label text nodes on language change
   */
  updateLabelsInPlace() {
    const e = this.element.querySelector(".rs-detail-related__title");
    e && (e.textContent = this.label("detail_related")), this.relatedProperties.length > 0 && this.renderProperties();
  }
  async loadRelated() {
    try {
      const t = (await RealtySoftAPI.getRelatedProperties(this.property.id, this.limit)).data || [];
      if (this.relatedProperties = t.slice(0, this.limit), this.relatedProperties.length === 0) {
        this.element.style.display = "none";
        return;
      }
      this.renderProperties();
    } catch (e) {
      console.error("Failed to load related properties:", e), this.element.style.display = "none";
    } finally {
      this.loader && (this.loader.style.display = "none");
    }
  }
  renderProperties() {
    this.grid && (this.grid.innerHTML = this.relatedProperties.map((e) => this.createCard(e)).join(""), this.grid.querySelectorAll(".rs-detail-related__card").forEach((e) => {
      e.addEventListener("click", () => {
        const t = e.dataset.propertyId, s = this.relatedProperties.find((i) => String(i.id) === t);
        s && RealtySoftAnalytics.trackCardClick(s);
      });
    }));
  }
  generatePropertyUrl(e) {
    if (e.url) return e.url;
    const t = RealtySoftState.get("config.propertyPageSlug") || "property", s = e.ref || e.id, r = (e.title || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").substring(0, 80);
    return `/${t}/${r}-${s}`;
  }
  createCard(e) {
    const t = e.images && e.images[0] || "/realtysoft/assets/placeholder.jpg", s = RealtySoftLabels.formatPrice(e.price);
    return `
      <a href="${this.generatePropertyUrl(e)}"
         class="rs-detail-related__card"
         data-property-id="${e.id}">
        <div class="rs-detail-related__card-image">
          <img src="${t}" alt="${this.escapeHtml(e.title)}" loading="lazy">
        </div>
        <div class="rs-detail-related__card-content">
          <div class="rs-detail-related__card-price">${s}</div>
          <h4 class="rs-detail-related__card-title">${this.escapeHtml(e.title)}</h4>
          <div class="rs-detail-related__card-location">${this.escapeHtml(e.location || "")}</div>
          <div class="rs-detail-related__card-specs">
            ${e.beds ? `<span>${e.beds} ${this.label("card_beds")}</span>` : ""}
            ${e.baths ? `<span>${e.baths} ${this.label("card_baths")}</span>` : ""}
            ${e.built_area ? `<span>${e.built_area} m²</span>` : ""}
          </div>
        </div>
      </a>
    `;
  }
  escapeHtml(e) {
    if (!e) return "";
    const t = document.createElement("div");
    return t.textContent = e, t.innerHTML;
  }
}
class Ft extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "property", null);
    this.init();
  }
  init() {
    var e;
    if (this.property = (e = this.options) == null ? void 0 : e.property, !this.property) {
      this.element.style.display = "none";
      return;
    }
    this.render();
  }
  render() {
    const e = this.property;
    this.element.classList.add("rs-detail-info-table");
    const t = [];
    if (e.type && t.push({ label: this.label("detail_property_type"), value: e.type }), e.status && t.push({ label: this.label("detail_status"), value: e.status }), e.ref && t.push({ label: this.label("detail_reference"), value: e.ref }), e.unique_ref && t.push({ label: this.label("detail_unique_ref"), value: e.unique_ref }), e.year_built && t.push({ label: this.label("detail_year_built"), value: e.year_built }), e.postal_code && t.push({ label: this.label("detail_postal_code"), value: e.postal_code }), e.floor && t.push({ label: this.label("detail_floor"), value: e.floor }), e.orientation && t.push({ label: this.label("detail_orientation"), value: e.orientation }), e.condition && t.push({ label: this.label("detail_condition"), value: e.condition }), e.furnished && t.push({ label: this.label("detail_furnished"), value: e.furnished }), e.views && t.push({ label: this.label("detail_views"), value: e.views }), e.parking && e.parking > 0 && t.push({ label: this.label("detail_parking"), value: e.parking }), t.length === 0) {
      this.element.style.display = "none";
      return;
    }
    this.element.innerHTML = `
      <h3 class="rs-detail-info-table__title">${this.label("detail_property_info")}</h3>
      <table class="rs-detail-info-table__table">
        <tbody>
          ${t.map((s) => `
            <tr class="rs-detail-info-table__row">
              <td class="rs-detail-info-table__label">${s.label}</td>
              <td class="rs-detail-info-table__value">${this.escapeHtml(String(s.value))}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  }
  escapeHtml(e) {
    if (!e) return "";
    const t = document.createElement("div");
    return t.textContent = e, t.innerHTML;
  }
}
class Ht extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "property", null);
    this.init();
  }
  init() {
    var e;
    if (this.property = (e = this.options) == null ? void 0 : e.property, !this.property) {
      this.element.style.display = "none";
      return;
    }
    this.render();
  }
  render() {
    const e = this.property;
    this.element.classList.add("rs-detail-specs");
    const t = [];
    if (e.beds && parseFloat(String(e.beds)) > 0 && t.push({
      icon: this.getIcon("beds"),
      value: e.beds,
      label: this.label("card_beds") || "Beds"
    }), e.baths && parseFloat(String(e.baths)) > 0 && t.push({
      icon: this.getIcon("baths"),
      value: e.baths,
      label: this.label("card_baths") || "Baths"
    }), e.built_area && parseFloat(String(e.built_area)) > 0 && t.push({
      icon: this.getIcon("built"),
      value: `${e.built_area} m²`,
      label: this.label("detail_built_area") || "Built"
    }), e.plot_size && parseFloat(String(e.plot_size)) > 0 && t.push({
      icon: this.getIcon("plot"),
      value: `${e.plot_size} m²`,
      label: this.label("detail_plot_size") || "Plot"
    }), e.terrace_size && parseFloat(String(e.terrace_size)) > 0 && t.push({
      icon: this.getIcon("terrace"),
      value: `${e.terrace_size} m²`,
      label: this.label("detail_terrace") || "Terrace"
    }), t.length === 0) {
      this.element.style.display = "none";
      return;
    }
    this.element.innerHTML = `
      <div class="rs-detail-specs__grid">
        ${t.map((s) => `
          <div class="rs-detail-specs__item">
            <span class="rs-detail-specs__icon">${s.icon}</span>
            <span class="rs-detail-specs__value">${s.value}</span>
            <span class="rs-detail-specs__label">${s.label}</span>
          </div>
        `).join("")}
      </div>
    `;
  }
  getIcon(e) {
    const t = {
      beds: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v11m0-4h18m0 4V8a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3"/><path d="M7 11v-1a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1"/></svg>',
      baths: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"/><path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"/><circle cx="9" cy="6" r="1"/></svg>',
      built: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>',
      plot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 17l4-8 4 5 5-6"/></svg>',
      terrace: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>'
    };
    return t[e] || t.built;
  }
}
class Vt extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "property", null);
    this.init();
  }
  init() {
    var e;
    if (this.property = (e = this.options) == null ? void 0 : e.property, !this.property) {
      this.element.style.display = "none";
      return;
    }
    this.render();
  }
  render() {
    const e = this.property;
    this.element.classList.add("rs-detail-sizes");
    const t = [];
    if (e.built_area && parseFloat(String(e.built_area)) > 0 && t.push({
      icon: this.getIcon("built"),
      label: this.label("detail_built_area"),
      value: `${e.built_area} m²`
    }), e.plot_size && parseFloat(String(e.plot_size)) > 0 && t.push({
      icon: this.getIcon("plot"),
      label: this.label("detail_plot_size"),
      value: `${e.plot_size} m²`
    }), e.usable_area && parseFloat(String(e.usable_area)) > 0 && t.push({
      icon: this.getIcon("usable"),
      label: this.label("detail_usable_area"),
      value: `${e.usable_area} m²`
    }), e.terrace_size && parseFloat(String(e.terrace_size)) > 0 && t.push({
      icon: this.getIcon("terrace"),
      label: this.label("detail_terrace"),
      value: `${e.terrace_size} m²`
    }), e.solarium_size && parseFloat(String(e.solarium_size)) > 0 && t.push({
      icon: this.getIcon("solarium"),
      label: this.label("detail_solarium"),
      value: `${e.solarium_size} m²`
    }), e.garden_size && parseFloat(String(e.garden_size)) > 0 && t.push({
      icon: this.getIcon("garden"),
      label: this.label("detail_garden"),
      value: `${e.garden_size} m²`
    }), t.length === 0) {
      this.element.style.display = "none";
      return;
    }
    this.element.innerHTML = `
      <h3 class="rs-detail-sizes__title">${this.label("detail_sizes")}</h3>
      <div class="rs-detail-sizes__grid">
        ${t.map((s) => `
          <div class="rs-detail-sizes__item">
            <div class="rs-detail-sizes__icon">${s.icon}</div>
            <div class="rs-detail-sizes__content">
              <span class="rs-detail-sizes__label">${s.label}</span>
              <span class="rs-detail-sizes__value">${s.value}</span>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }
  getIcon(e) {
    const t = {
      built: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>',
      plot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 17l4-8 4 5 5-6"/></svg>',
      usable: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6v6H9z"/></svg>',
      terrace: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
      solarium: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>',
      garden: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22V12"/><path d="M12 12c-2.5 0-4.5-2-4.5-4.5S9.5 3 12 3s4.5 2 4.5 4.5S14.5 12 12 12z"/><path d="M7 22h10"/></svg>'
    };
    return t[e] || t.built;
  }
}
class Nt extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "property", null);
    this.init();
  }
  init() {
    var e;
    if (this.property = (e = this.options) == null ? void 0 : e.property, !this.property) {
      this.element.style.display = "none";
      return;
    }
    this.render();
  }
  render() {
    const e = this.property;
    this.element.classList.add("rs-detail-taxes");
    const t = [];
    if (e.community_fees && parseFloat(String(e.community_fees)) > 0 && t.push({
      label: this.label("detail_community_fees"),
      value: RealtySoftLabels.formatPrice(e.community_fees),
      period: this.label("detail_per_month")
    }), e.ibi_tax && parseFloat(String(e.ibi_tax)) > 0 && t.push({
      label: this.label("detail_ibi_tax"),
      value: RealtySoftLabels.formatPrice(e.ibi_tax),
      period: this.label("detail_per_year")
    }), e.basura_tax && parseFloat(String(e.basura_tax)) > 0 && t.push({
      label: this.label("detail_basura_tax"),
      value: RealtySoftLabels.formatPrice(e.basura_tax),
      period: this.label("detail_per_year")
    }), t.length === 0) {
      this.element.style.display = "none";
      return;
    }
    this.element.innerHTML = `
      <h3 class="rs-detail-taxes__title">${this.label("detail_taxes_fees")}</h3>
      <div class="rs-detail-taxes__list">
        ${t.map((s) => `
          <div class="rs-detail-taxes__item">
            <span class="rs-detail-taxes__label">${s.label}</span>
            <span class="rs-detail-taxes__value">
              ${s.value}
              <span class="rs-detail-taxes__period">${s.period}</span>
            </span>
          </div>
        `).join("")}
      </div>
    `;
  }
}
class jt extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "property", null);
    this.init();
  }
  init() {
    var t;
    if (this.property = (t = this.options) == null ? void 0 : t.property, !this.property) {
      this.element.style.display = "none";
      return;
    }
    const e = this.property;
    if (!e.energy_rating && !e.co2_rating && !e.energy_certificate_image) {
      this.element.style.display = "none";
      return;
    }
    this.render();
  }
  render() {
    const e = this.property;
    this.element.classList.add("rs-detail-energy"), this.element.innerHTML = `
      <h3 class="rs-detail-energy__title">${this.label("detail_energy_certificate")}</h3>
      <div class="rs-detail-energy__content">
        ${e.energy_rating ? this.renderRatingScale("energy", e.energy_rating, this.label("detail_energy_rating")) : ""}
        ${e.co2_rating ? this.renderRatingScale("co2", e.co2_rating, this.label("detail_co2_rating")) : ""}
        ${e.energy_consumption ? `
          <div class="rs-detail-energy__consumption">
            <span class="rs-detail-energy__consumption-label">${this.label("detail_energy_consumption")}</span>
            <span class="rs-detail-energy__consumption-value">${e.energy_consumption}</span>
          </div>
        ` : ""}
        ${e.energy_certificate_image ? `
          <div class="rs-detail-energy__image">
            <img src="${this.getAbsoluteImageUrl(e.energy_certificate_image)}" alt="${this.label("detail_energy_certificate")}" loading="lazy">
          </div>
        ` : ""}
      </div>
    `;
  }
  renderRatingScale(e, t, s) {
    const i = ["A", "B", "C", "D", "E", "F", "G"], r = {
      energy: {
        A: "#00a651",
        B: "#4cb848",
        C: "#8dc63f",
        D: "#fff200",
        E: "#f7941d",
        F: "#f26522",
        G: "#ed1c24"
      },
      co2: {
        A: "#9e7cc3",
        B: "#b18fcf",
        C: "#c4a2db",
        D: "#d7b5e7",
        E: "#eac8f3",
        F: "#f5dbff",
        G: "#ffe0ff"
      }
    }, a = t.toUpperCase().charAt(0), l = r[e] || r.energy;
    return `
      <div class="rs-detail-energy__scale rs-detail-energy__scale--${e}">
        <span class="rs-detail-energy__scale-label">${s}</span>
        <div class="rs-detail-energy__scale-bars">
          ${i.map((d) => {
      const y = d === a, p = l[d] || "#ccc";
      return `
              <div class="rs-detail-energy__scale-bar ${y ? "rs-detail-energy__scale-bar--active" : ""}"
                   style="background-color: ${p}">
                <span class="rs-detail-energy__scale-letter">${d}</span>
              </div>
            `;
    }).join("")}
        </div>
        <span class="rs-detail-energy__scale-value">${t}</span>
      </div>
    `;
  }
  getAbsoluteImageUrl(e) {
    if (!e) return "";
    if (e.startsWith("http")) return e;
    const t = RealtySoftState.get("config.apiUrl") || "";
    return t ? t.replace(/\/api\/?$/, "").replace(/\/$/, "") + (e.startsWith("/") ? "" : "/") + e : e;
  }
}
class Ot extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "property", null);
    o(this, "modal", null);
    o(this, "modalBody", null);
    this.init();
  }
  init() {
    var t;
    if (this.property = (t = this.options) == null ? void 0 : t.property, !this.property) {
      this.element.style.display = "none";
      return;
    }
    const e = this.property;
    if (!e.video_url && !e.virtual_tour_url && !e.pdf_url) {
      this.element.style.display = "none";
      return;
    }
    this.render(), this.bindEvents();
  }
  render() {
    const e = this.property;
    this.element.classList.add("rs-detail-resources");
    const t = [];
    e.video_url && t.push({
      type: "video",
      url: e.video_url,
      icon: this.getIcon("video"),
      label: this.label("detail_video_tour"),
      isEmbed: this.isEmbeddable(e.video_url)
    }), e.virtual_tour_url && t.push({
      type: "tour",
      url: e.virtual_tour_url,
      icon: this.getIcon("tour"),
      label: this.label("detail_virtual_tour"),
      isEmbed: !0
    }), e.pdf_url && t.push({
      type: "pdf",
      url: e.pdf_url,
      icon: this.getIcon("pdf"),
      label: this.label("detail_download_pdf"),
      isEmbed: !1
    }), this.element.innerHTML = `
      <h3 class="rs-detail-resources__title">${this.label("detail_additional_resources")}</h3>
      <div class="rs-detail-resources__grid">
        ${t.map((s) => `
          <button type="button"
                  class="rs-detail-resources__btn rs-detail-resources__btn--${s.type}"
                  data-type="${s.type}"
                  data-url="${this.escapeAttr(s.url)}"
                  data-embed="${s.isEmbed}">
            <span class="rs-detail-resources__btn-icon">${s.icon}</span>
            <span class="rs-detail-resources__btn-label">${s.label}</span>
          </button>
        `).join("")}
      </div>
      <div class="rs-detail-resources__modal" style="display: none;">
        <div class="rs-detail-resources__modal-backdrop"></div>
        <div class="rs-detail-resources__modal-content">
          <button type="button" class="rs-detail-resources__modal-close">&times;</button>
          <div class="rs-detail-resources__modal-body"></div>
        </div>
      </div>
    `, this.modal = this.element.querySelector(".rs-detail-resources__modal"), this.modalBody = this.element.querySelector(".rs-detail-resources__modal-body");
  }
  bindEvents() {
    var e, t;
    this.element.querySelectorAll(".rs-detail-resources__btn").forEach((s) => {
      s.addEventListener("click", () => {
        const i = s.dataset.type || "", r = s.dataset.url || "", a = s.dataset.embed === "true";
        i === "pdf" ? (window.open(r, "_blank"), RealtySoftAnalytics.trackResourceClick("pdf", this.property.id)) : a ? (this.openModal(i, r), RealtySoftAnalytics.trackResourceClick(i, this.property.id)) : (window.open(r, "_blank"), RealtySoftAnalytics.trackResourceClick(i, this.property.id));
      });
    }), this.modal && ((e = this.modal.querySelector(".rs-detail-resources__modal-close")) == null || e.addEventListener("click", () => {
      this.closeModal();
    }), (t = this.modal.querySelector(".rs-detail-resources__modal-backdrop")) == null || t.addEventListener("click", () => {
      this.closeModal();
    })), document.addEventListener("keydown", (s) => {
      s.key === "Escape" && this.modal && this.modal.style.display !== "none" && this.closeModal();
    });
  }
  openModal(e, t) {
    let s = "";
    e === "video" ? s = `<iframe src="${this.getVideoEmbedUrl(t)}" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>` : e === "tour" && (s = `<iframe src="${t}" frameborder="0" allowfullscreen></iframe>`), this.modalBody && (this.modalBody.innerHTML = s), this.modal && (this.modal.style.display = "flex"), document.body.style.overflow = "hidden";
  }
  closeModal() {
    this.modal && (this.modal.style.display = "none"), this.modalBody && (this.modalBody.innerHTML = ""), document.body.style.overflow = "";
  }
  getVideoEmbedUrl(e) {
    const t = e.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (t)
      return `https://www.youtube.com/embed/${t[1]}?autoplay=1`;
    const s = e.match(/vimeo\.com\/(\d+)/);
    return s ? `https://player.vimeo.com/video/${s[1]}?autoplay=1` : e;
  }
  isEmbeddable(e) {
    return e.includes("youtube") || e.includes("youtu.be") || e.includes("vimeo");
  }
  getIcon(e) {
    const t = {
      video: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
      tour: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>',
      pdf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M12 18v-6"/><path d="M9 15l3 3 3-3"/></svg>'
    };
    return t[e] || t.pdf;
  }
  escapeAttr(e) {
    return e ? e.replace(/"/g, "&quot;").replace(/'/g, "&#39;") : "";
  }
}
class Wt extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "property", null);
    o(this, "pdfUrl", null);
    this.init();
  }
  init() {
    var s;
    if (this.property = (s = this.options) == null ? void 0 : s.property, !this.property) {
      this.element.style.display = "none";
      return;
    }
    const e = this.property, t = e._original || {};
    if (this.pdfUrl = e.pdf_url || t.pdf_url || t.pdf || t.brochure_url || t.brochure || t.pdf_link || t.document_url || t.flyer_url || t.flyer || null, !this.pdfUrl) {
      this.element.style.display = "none";
      return;
    }
    this.render(), this.bindEvents();
  }
  render() {
    this.element.classList.add("rs-detail-pdf"), this.element.innerHTML = `
      <a href="${this.pdfUrl}" target="_blank" class="rs-detail-pdf__btn" rel="noopener">
        <svg class="rs-detail-pdf__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <path d="M14 2v6h6"/>
          <path d="M12 18v-6"/>
          <path d="M9 15l3 3 3-3"/>
        </svg>
        <span class="rs-detail-pdf__text">${this.label("detail_download_pdf") || "Download PDF"}</span>
      </a>
    `;
  }
  bindEvents() {
    const e = this.element.querySelector(".rs-detail-pdf__btn");
    e && this.property && e.addEventListener("click", () => {
      RealtySoftAnalytics.trackResourceClick("pdf", this.property.id);
    });
  }
}
class Ut extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "property", null);
    o(this, "propertyId", null);
    o(this, "propertyRef", null);
    this.init();
  }
  init() {
    if (this.property = null, this.propertyId = null, this.propertyRef = null, this.clearStalePrefetch(), this.propertyId = this.getPropertyIdFromUrl(), this.propertyRef = this.getPropertyRefFromUrl(), !this.propertyId && !this.propertyRef) {
      const e = this.element.dataset.propertyId, t = this.element.dataset.propertyRef;
      e && (/^\d+$/.test(e) ? this.propertyId = e : this.propertyRef = e), t && (this.propertyRef = t);
    }
    !this.propertyId && !this.propertyRef && window._rsAutoInjectedRef && (this.propertyRef = window._rsAutoInjectedRef), this.element.classList.add("rs-detail"), this.propertyId || this.propertyRef ? this.loadProperty().then((e) => {
      var t;
      if (e) {
        if (this.propertyRef && ((t = e.ref) == null ? void 0 : t.toLowerCase()) !== this.propertyRef.toLowerCase()) {
          console.warn("[RealtySoft] Property ref mismatch - expected:", this.propertyRef, "got:", e.ref);
          return;
        }
        this.property = e, this.populateComponents();
      }
    }) : (console.warn("[RealtySoft] No property ID or reference found"), this.showError()), this.subscribe("currentProperty", (e) => {
      !e || !this.property || e.id === this.property.id && (this.property = e, this.populateComponents());
    });
  }
  getPropertyIdFromUrl() {
    const e = [
      /\/property\/(\d+)/,
      /[?&]id=(\d+)/,
      /[?&]property_id=(\d+)/
    ];
    for (const t of e) {
      const s = window.location.href.match(t);
      if (s) return s[1];
    }
    return null;
  }
  getPropertyRefFromUrl() {
    const t = new URLSearchParams(window.location.search).get("ref");
    if (t) return t.trim();
    const i = window.location.pathname.split("/").filter((a) => a), r = i[i.length - 1];
    if (r) {
      const a = r.replace(".html", ""), l = [
        /([A-Z]{1,4}\d+)/i,
        /(\d{6,})/,
        /([A-Z]{2,}\d*-\d+)/i,
        /-([A-Z0-9]+)$/i
      ];
      for (const d of l) {
        const y = a.match(d);
        if (y) return y[1];
      }
      if (!a.includes("-")) return a;
    }
    return null;
  }
  /**
   * Clear stale PHP prefetch data that doesn't match current URL
   * RACE CONDITION FIX: Be aggressive - if we can't verify match, clear it
   */
  clearStalePrefetch() {
    const e = window.__rsPrefetch;
    if (!e) return;
    const t = this.getPropertyRefFromUrl(), s = e.ref;
    t ? (!s || t.toLowerCase() !== s.toLowerCase()) && (console.log("[RealtySoft] Clearing stale prefetch - URL ref:", t, "prefetch ref:", s), delete window.__rsPrefetch) : (console.log("[RealtySoft] Clearing prefetch - could not determine URL ref"), delete window.__rsPrefetch);
  }
  async loadProperty() {
    this.element.classList.add("rs-detail--loading");
    try {
      let e = null;
      return this.propertyId ? e = await RealtySoft.loadProperty(parseInt(this.propertyId)) : this.propertyRef && (e = await RealtySoft.loadPropertyByRef(this.propertyRef)), e;
    } catch (e) {
      return console.error("[RealtySoft] Failed to load property:", e), this.showError(), null;
    } finally {
      this.element.classList.remove("rs-detail--loading");
    }
  }
  populateComponents() {
    var d, y, p, S, C, k, L;
    if (!this.property) return;
    const e = this.property, t = {
      // Basic Info
      rs_detail_title: e.title,
      rs_detail_price: e.price_on_request ? this.label("detail_price_on_request") : RealtySoftLabels.formatPrice(e.price),
      rs_detail_ref: e.ref,
      rs_detail_unique_ref: e.unique_ref,
      rs_detail_location: e.location,
      rs_detail_address: e.address,
      rs_detail_postal_code: e.postal_code,
      rs_detail_type: e.type,
      rs_detail_status: e.status,
      // Specs
      rs_detail_beds: e.beds && parseFloat(String(e.beds)) > 0 ? e.beds : "",
      rs_detail_baths: e.baths && parseFloat(String(e.baths)) > 0 ? e.baths : "",
      rs_detail_built: e.built_area && parseFloat(String(e.built_area)) > 0 ? `${e.built_area} m²` : "",
      rs_detail_plot: e.plot_size && parseFloat(String(e.plot_size)) > 0 ? `${e.plot_size} m²` : "",
      rs_detail_terrace: e.terrace_size && parseFloat(String(e.terrace_size)) > 0 ? `${e.terrace_size} m²` : "",
      rs_detail_solarium: e.solarium_size && parseFloat(String(e.solarium_size)) > 0 ? `${e.solarium_size} m²` : "",
      rs_detail_garden: e.garden_size && parseFloat(String(e.garden_size)) > 0 ? `${e.garden_size} m²` : "",
      rs_detail_usable: e.usable_area && parseFloat(String(e.usable_area)) > 0 ? `${e.usable_area} m²` : "",
      rs_detail_year: e.year_built,
      rs_detail_floor: e.floor,
      rs_detail_orientation: e.orientation,
      rs_detail_parking: e.parking,
      rs_detail_furnished: e.furnished,
      rs_detail_condition: e.condition,
      rs_detail_views: e.views,
      // Taxes & Fees
      rs_detail_community_fees: e.community_fees && parseFloat(String(e.community_fees)) > 0 ? RealtySoftLabels.formatPrice(e.community_fees) + "/mo" : "",
      rs_detail_ibi_tax: e.ibi_tax && parseFloat(String(e.ibi_tax)) > 0 ? RealtySoftLabels.formatPrice(e.ibi_tax) + "/yr" : "",
      rs_detail_basura_tax: e.basura_tax && parseFloat(String(e.basura_tax)) > 0 ? RealtySoftLabels.formatPrice(e.basura_tax) + "/yr" : "",
      // Energy
      rs_detail_energy_rating: e.energy_rating,
      rs_detail_co2_rating: e.co2_rating,
      rs_detail_energy_consumption: e.energy_consumption,
      // Content
      rs_detail_description: this.formatDescription(e.description),
      // Agent
      rs_detail_agent_name: (d = e.agent) == null ? void 0 : d.name,
      rs_detail_agent_phone: (y = e.agent) == null ? void 0 : y.phone,
      rs_detail_agent_email: (p = e.agent) == null ? void 0 : p.email
    };
    for (const [f, u] of Object.entries(t))
      this.element.querySelectorAll(`.${f}`).forEach((b) => {
        u != null && u !== "" ? (b.innerHTML = String(u), b.style.display = "") : b.style.display = "none";
      });
    const s = ((S = e.agent) == null ? void 0 : S.name) && e.agent.name.trim() && e.agent.name.toLowerCase() !== "undefined", i = ((C = e.agent) == null ? void 0 : C.phone) && e.agent.phone.trim(), r = ((k = e.agent) == null ? void 0 : k.email) && e.agent.email.trim(), a = s || i || r;
    this.element.querySelectorAll(".rs_detail_agent").forEach((f) => {
      f.style.display = a ? "" : "none";
    }), this.element.querySelectorAll(".rs_detail_agent_phone").forEach((f) => {
      i && e.agent ? (f.textContent = e.agent.phone, f.tagName === "A" && (f.href = `tel:${e.agent.phone.replace(/\s/g, "")}`), f.style.display = "") : f.style.display = "none";
    }), this.element.querySelectorAll(".rs_detail_agent_email").forEach((f) => {
      r && e.agent ? (f.textContent = e.agent.email, f.tagName === "A" && (f.href = `mailto:${e.agent.email}`), f.style.display = "") : f.style.display = "none";
    }), this.element.querySelectorAll(".rs_detail_agent_photo").forEach((f) => {
      var u;
      (u = e.agent) != null && u.photo ? (f.innerHTML = `<img src="${e.agent.photo}" alt="${this.escapeHtml(e.agent.name || "")}">`, f.style.display = "") : f.style.display = "none";
    });
    const l = [
      [".rs_detail_back", Bt],
      [".rs_detail_gallery", Ie],
      [".rs_detail_features", Dt],
      [".rs_detail_map", Ae],
      [".rs_detail_inquiry_form", qe],
      [".rs_detail_wishlist", ze],
      [".rs_detail_share", Be],
      [".rs_detail_related", De],
      [".rs_detail_info_table", Ft],
      [".rs_detail_specs", Ht],
      [".rs_detail_sizes", Vt],
      [".rs_detail_taxes", Nt],
      [".rs_detail_energy", jt],
      [".rs_detail_resources", Ot],
      [".rs_detail_pdf", Wt]
    ];
    for (const [f, u] of l)
      this.element.querySelectorAll(f).forEach((b) => {
        b._rsComponent || new u(b, { property: e });
      });
    this.element.querySelectorAll(".rs_detail_energy_image").forEach((f) => {
      e.energy_certificate_image ? (f.innerHTML = `<img src="${e.energy_certificate_image}" alt="${this.label("detail_energy_certificate")}">`, f.style.display = "") : f.style.display = "none";
    }), this.element.querySelectorAll(".rs_detail_video_link").forEach((f) => {
      e.video_url ? (f.tagName === "A" && (f.href = e.video_url, f.target = "_blank"), f.style.display = "") : f.style.display = "none";
    }), this.element.querySelectorAll(".rs_detail_tour_link").forEach((f) => {
      e.virtual_tour_url ? (f.tagName === "A" && (f.href = e.virtual_tour_url, f.target = "_blank"), f.style.display = "") : f.style.display = "none";
    }), this.element.querySelectorAll(".rs_detail_pdf_link").forEach((f) => {
      e.pdf_url ? (f.tagName === "A" && (f.href = e.pdf_url, f.target = "_blank"), f.style.display = "") : f.style.display = "none";
    }), e.title && (document.title = `${e.title} | ${((L = document.title.split("|").pop()) == null ? void 0 : L.trim()) || "Property"}`);
  }
  formatDescription(e) {
    return e ? /<[^>]+>/g.test(e) ? e : this.escapeHtml(e).replace(/\r\n/g, "<br>").replace(/\n/g, "<br>").replace(/\r/g, "<br>") : "";
  }
  showError() {
    this.element.innerHTML = `
      <div class="rs-detail__error">
        <p>${this.label("general_error")}</p>
        <button class="rs-detail__retry" onclick="location.reload()">
          ${this.label("general_retry")}
        </button>
      </div>
    `;
  }
  escapeHtml(e) {
    if (!e) return "";
    const t = document.createElement("div");
    return t.textContent = e, t.innerHTML;
  }
}
RealtySoft.registerComponent("rs_detail", Ut);
class Kt extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "property", null);
    o(this, "propertyId", null);
    o(this, "propertyRef", null);
    o(this, "hasInitiallyRendered", !1);
    this.init();
  }
  init() {
    if (this.property = null, this.propertyId = null, this.propertyRef = null, this.clearStalePrefetch(), this.propertyId = this.getPropertyIdFromUrl(), this.propertyRef = this.getPropertyRefFromUrl(), !this.propertyId && !this.propertyRef) {
      const e = this.element.dataset.propertyId, t = this.element.dataset.propertyRef;
      e && (/^\d+$/.test(e) ? this.propertyId = e : this.propertyRef = e), t && (this.propertyRef = t);
    }
    this.element.classList.add("rs-property-detail-template"), this.propertyId || this.propertyRef ? (this.showSkeleton(), this.loadProperty().then((e) => {
      var t;
      if (e) {
        if (this.propertyRef && ((t = e.ref) == null ? void 0 : t.toLowerCase()) !== this.propertyRef.toLowerCase()) {
          console.warn("[RealtySoft] Property ref mismatch - expected:", this.propertyRef, "got:", e.ref);
          return;
        }
        this.property = e, this.render();
      }
    })) : this.showError("No property ID or reference found"), this.subscribe("currentProperty", (e) => {
      !e || !this.property || e.id === this.property.id && (this.property = e);
    }), this.subscribe("language", () => {
      this.hasInitiallyRendered && this.property && this.updateLabelsInPlace();
    });
  }
  /**
   * Get cached property from localStorage
   */
  getCachedProperty() {
    const e = this.propertyRef || this.propertyId;
    if (!e) return null;
    const t = !!this.propertyRef;
    return RealtySoftAPI.getCachedProperty(e, t);
  }
  /**
   * Validate that cached property matches what we're looking for
   * Prevents showing wrong property from stale cache
   */
  isCacheValid(e) {
    return this.propertyRef ? (e.ref || "").toLowerCase() === this.propertyRef.toLowerCase() : this.propertyId ? String(e.id) === this.propertyId : !1;
  }
  getPropertyIdFromUrl() {
    const e = [
      /\/property\/(\d+)/,
      /[?&]id=(\d+)/,
      /[?&]property_id=(\d+)/
    ];
    for (const t of e) {
      const s = window.location.href.match(t);
      if (s) return s[1];
    }
    return null;
  }
  getPropertyRefFromUrl() {
    const e = RealtySoftState.get("config.propertyPageSlug") || "property", t = new URLSearchParams(window.location.search), s = t.get("ref") || t.get("reference");
    if (s) return s.trim();
    const i = new RegExp(`/${e}/(.+?)/?$`, "i"), r = window.location.pathname.match(i);
    if (!r) return null;
    const a = r[1], l = a.split("-");
    if (l.length > 1) {
      const d = l[l.length - 1];
      if (/^[A-Z0-9]{3,}$/i.test(d) && !/^\d+$/.test(d)) return d;
    }
    return /^[A-Z0-9]{3,}$/i.test(a) && !/^\d+$/.test(a) ? a : null;
  }
  /**
   * Clear stale PHP prefetch data that doesn't match current URL
   * RACE CONDITION FIX: Be aggressive - if we can't verify match, clear it
   */
  clearStalePrefetch() {
    const e = window.__rsPrefetch;
    if (!e) return;
    const t = this.getPropertyRefFromUrl(), s = e.ref;
    t ? (!s || t.toLowerCase() !== s.toLowerCase()) && (console.log("[RealtySoft] Clearing stale prefetch - URL ref:", t, "prefetch ref:", s), delete window.__rsPrefetch) : (console.log("[RealtySoft] Clearing prefetch - could not determine URL ref"), delete window.__rsPrefetch);
  }
  async loadProperty(e = !1) {
    try {
      let t = null;
      return this.propertyId ? t = await RealtySoft.loadProperty(parseInt(this.propertyId)) : this.propertyRef && (t = await RealtySoft.loadPropertyByRef(this.propertyRef)), t;
    } catch (t) {
      return console.error("Failed to load property:", t), !this.property && !e && this.showError("Failed to load property details"), null;
    }
  }
  /**
   * Show skeleton loader for instant perceived performance
   */
  showSkeleton() {
    this.element.innerHTML = `
      <div class="rs-property-detail-template__skeleton">
        <div class="rs-skeleton__gallery">
          <div class="rs-skeleton__image rs-skeleton__pulse"></div>
        </div>
        <div class="rs-skeleton__header">
          <div class="rs-skeleton__title rs-skeleton__pulse"></div>
          <div class="rs-skeleton__price rs-skeleton__pulse"></div>
          <div class="rs-skeleton__location rs-skeleton__pulse"></div>
        </div>
        <div class="rs-skeleton__specs">
          <div class="rs-skeleton__spec rs-skeleton__pulse"></div>
          <div class="rs-skeleton__spec rs-skeleton__pulse"></div>
          <div class="rs-skeleton__spec rs-skeleton__pulse"></div>
          <div class="rs-skeleton__spec rs-skeleton__pulse"></div>
        </div>
        <div class="rs-skeleton__content">
          <div class="rs-skeleton__main">
            <div class="rs-skeleton__section">
              <div class="rs-skeleton__section-title rs-skeleton__pulse"></div>
              <div class="rs-skeleton__text rs-skeleton__pulse"></div>
              <div class="rs-skeleton__text rs-skeleton__pulse"></div>
              <div class="rs-skeleton__text rs-skeleton__pulse" style="width: 60%"></div>
            </div>
          </div>
          <div class="rs-skeleton__sidebar">
            <div class="rs-skeleton__card rs-skeleton__pulse"></div>
          </div>
        </div>
      </div>
      <style>
        .rs-property-detail-template__skeleton { padding: 20px; }
        .rs-skeleton__pulse {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: rs-skeleton-pulse 1.5s infinite;
          border-radius: 4px;
        }
        @keyframes rs-skeleton-pulse {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .rs-skeleton__gallery { height: 400px; margin-bottom: 20px; }
        .rs-skeleton__image { height: 100%; }
        .rs-skeleton__header { margin-bottom: 20px; }
        .rs-skeleton__title { height: 32px; width: 70%; margin-bottom: 12px; }
        .rs-skeleton__price { height: 28px; width: 30%; margin-bottom: 8px; }
        .rs-skeleton__location { height: 20px; width: 50%; }
        .rs-skeleton__specs { display: flex; gap: 20px; margin-bottom: 30px; }
        .rs-skeleton__spec { height: 60px; width: 100px; }
        .rs-skeleton__content { display: grid; grid-template-columns: 1fr 350px; gap: 30px; }
        .rs-skeleton__section { margin-bottom: 20px; }
        .rs-skeleton__section-title { height: 24px; width: 40%; margin-bottom: 15px; }
        .rs-skeleton__text { height: 16px; margin-bottom: 10px; }
        .rs-skeleton__card { height: 300px; }
        @media (max-width: 768px) {
          .rs-skeleton__content { grid-template-columns: 1fr; }
          .rs-skeleton__gallery { height: 250px; }
        }
      </style>
    `;
  }
  showError(e) {
    this.element.innerHTML = `
      <div class="rs-property-detail-template__error">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p>${e}</p>
        <button onclick="location.reload()" class="rs-property-detail-template__retry-btn">
          Try Again
        </button>
      </div>
    `;
  }
  render() {
    if (!this.property) return;
    if (this.hasInitiallyRendered) {
      this.updateLabelsInPlace();
      return;
    }
    this.hasInitiallyRendered = !0;
    const e = this.property;
    e.title && (document.title = `${e.title} | Property Details`), this.element.innerHTML = `
      <!-- Gallery Section -->
      <div class="rs-template__gallery" id="rs-template-gallery"></div>

      <!-- Header Section -->
      <div class="rs-template__header">
        <div class="rs-template__header-main">
          <h1 class="rs-template__title">${this.escapeHtml(e.title || "")}</h1>
          <div class="rs-template__price ${e.price_on_request ? "rs-template__price--por" : ""}">
            ${e.price_on_request ? this.label("detail_price_on_request") : RealtySoftLabels.formatPrice(e.price)}
          </div>
          <div class="rs-template__location">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>${this.escapeHtml(e.location || e.address || "")}</span>
          </div>
          ${e.ref ? `<div class="rs-template__ref">Ref: ${this.escapeHtml(e.ref)}</div>` : ""}
        </div>
        <div class="rs-template__header-actions">
          <div class="rs-template__share" id="rs-template-share"></div>
          <div class="rs-template__wishlist" id="rs-template-wishlist"></div>
        </div>
      </div>

      <!-- Key Specs -->
      <div class="rs-template__specs">
        ${this.renderKeySpecs(e)}
      </div>

      <!-- Main Content -->
      <div class="rs-template__content">
        <div class="rs-template__main">
          ${this.renderPropertyInfo(e)}
          ${this.renderAdditionalSizes(e)}
          ${e.description ? `
            <div class="rs-template__section">
              <h2 class="rs-template__section-title rs-template__section-title--description">${this.label("detail_description")}</h2>
              <div class="rs-template__description rs-template__description--clamped" id="rs-template-description">${this.formatDescription(e.description)}</div>
              <button class="rs-template__read-more" id="rs-template-read-more" style="display:none;">
                ${this.label("detail_read_more") || "Read More"}
              </button>
            </div>
          ` : ""}
          ${this.renderFeatures(e)}
          ${this.renderResources(e)}
          ${this.renderTaxes(e)}
          ${this.renderEnergy(e)}
        </div>

        <div class="rs-template__sidebar">
          ${this.renderAgentCard(e)}
          ${this.renderSidebarPdf(e)}
          <div class="rs-template__inquiry-form" id="rs-template-inquiry"></div>
        </div>
      </div>

      <!-- Map Section -->
      <div class="rs-template__section rs-template__section--full">
        <div class="rs-template__map" id="rs-template-map" data-variation="1"></div>
      </div>

      <!-- Related Properties -->
      <div class="rs-template__section rs-template__section--full">
        <div class="rs-template__related" id="rs-template-related" data-limit="6"></div>
      </div>
    `, this.initChildComponents();
  }
  renderKeySpecs(e) {
    const t = [];
    return e.beds && parseFloat(String(e.beds)) > 0 && t.push(`
        <div class="rs-template__spec">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 4v16"></path>
            <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
            <path d="M2 17h20"></path>
            <path d="M6 8v9"></path>
          </svg>
          <span class="rs-template__spec-value">${e.beds}</span>
          <span class="rs-template__spec-label">${this.label("card_beds")}</span>
        </div>
      `), e.baths && parseFloat(String(e.baths)) > 0 && t.push(`
        <div class="rs-template__spec">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"></path>
            <path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"></path>
            <circle cx="12" cy="5" r="2"></circle>
          </svg>
          <span class="rs-template__spec-value">${e.baths}</span>
          <span class="rs-template__spec-label">${this.label("card_baths")}</span>
        </div>
      `), e.built_area && parseFloat(String(e.built_area)) > 0 && t.push(`
        <div class="rs-template__spec">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"></rect>
            <path d="M3 9h18"></path>
            <path d="M9 21V9"></path>
          </svg>
          <span class="rs-template__spec-value">${e.built_area}m²</span>
          <span class="rs-template__spec-label">${this.label("detail_built_area")}</span>
        </div>
      `), e.plot_size && parseFloat(String(e.plot_size)) > 0 && t.push(`
        <div class="rs-template__spec">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6l9-4 9 4v12l-9 4-9-4V6z"></path>
            <path d="M12 2v20"></path>
          </svg>
          <span class="rs-template__spec-value">${e.plot_size}m²</span>
          <span class="rs-template__spec-label">${this.label("detail_plot_size")}</span>
        </div>
      `), t.join("");
  }
  renderPropertyInfo(e) {
    const t = [];
    return e.type && t.push({ label: this.label("detail_property_type"), value: e.type }), e.status && t.push({ label: this.label("detail_status"), value: e.status }), e.year_built && t.push({ label: this.label("detail_year_built"), value: e.year_built }), e.ref && t.push({ label: this.label("detail_reference"), value: e.ref }), e.unique_ref && t.push({ label: this.label("detail_unique_ref"), value: e.unique_ref }), e.postal_code && t.push({ label: this.label("detail_postal_code"), value: e.postal_code }), e.floor && t.push({ label: this.label("detail_floor"), value: e.floor }), e.orientation && t.push({ label: this.label("detail_orientation"), value: e.orientation }), e.condition && t.push({ label: this.label("detail_condition"), value: e.condition }), e.furnished && t.push({ label: this.label("detail_furnished"), value: e.furnished }), e.views && t.push({ label: this.label("detail_views"), value: e.views }), e.parking && t.push({ label: this.label("detail_parking"), value: e.parking }), t.length === 0 ? "" : `
      <div class="rs-template__section rs-template__section--property-info">
        <h2 class="rs-template__section-title rs-template__section-title--property-info">${this.label("detail_property_info")}</h2>
        <div class="rs-template__info-grid">
          ${t.map((s) => `
            <div class="rs-template__info-row">
              <span class="rs-template__info-label">${s.label}</span>
              <span class="rs-template__info-value">${this.escapeHtml(String(s.value))}</span>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }
  renderAdditionalSizes(e) {
    const t = [];
    return e.terrace_size && parseFloat(String(e.terrace_size)) > 0 && t.push({ label: this.label("detail_terrace"), value: `${e.terrace_size}m²` }), e.solarium_size && parseFloat(String(e.solarium_size)) > 0 && t.push({ label: this.label("detail_solarium"), value: `${e.solarium_size}m²` }), e.garden_size && parseFloat(String(e.garden_size)) > 0 && t.push({ label: this.label("detail_garden"), value: `${e.garden_size}m²` }), e.usable_area && parseFloat(String(e.usable_area)) > 0 && t.push({ label: this.label("detail_usable_area"), value: `${e.usable_area}m²` }), t.length === 0 ? "" : `
      <div class="rs-template__section rs-template__section--sizes">
        <h2 class="rs-template__section-title rs-template__section-title--sizes">${this.label("detail_sizes")}</h2>
        <div class="rs-template__info-grid">
          ${t.map((s) => `
            <div class="rs-template__info-row">
              <span class="rs-template__info-label">${s.label}</span>
              <span class="rs-template__info-value">${s.value}</span>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }
  renderResources(e) {
    const t = [];
    return e.video_url && t.push(`
        <a href="${e.video_url}" target="_blank" rel="noopener" class="rs-template__resource rs-template__resource--video">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          <span class="rs-template__resource-text">${this.label("detail_video_tour")}</span>
        </a>
      `), e.virtual_tour_url && t.push(`
        <a href="${e.virtual_tour_url}" target="_blank" rel="noopener" class="rs-template__resource rs-template__resource--virtual">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
            <path d="M2 12h20"></path>
          </svg>
          <span class="rs-template__resource-text">${this.label("detail_virtual_tour")}</span>
        </a>
      `), t.length === 0 ? "" : `
      <div class="rs-template__section rs-template__section--resources">
        <h2 class="rs-template__section-title rs-template__section-title--resources">${this.label("detail_additional_resources")}</h2>
        <div class="rs-template__resources">
          ${t.join("")}
        </div>
      </div>
    `;
  }
  renderTaxes(e) {
    const t = [];
    return e.community_fees && parseFloat(String(e.community_fees)) > 0 && t.push({
      label: this.label("detail_community_fees"),
      value: RealtySoftLabels.formatPrice(e.community_fees) + this.label("detail_per_month")
    }), e.ibi_tax && parseFloat(String(e.ibi_tax)) > 0 && t.push({
      label: this.label("detail_ibi_tax"),
      value: RealtySoftLabels.formatPrice(e.ibi_tax) + this.label("detail_per_year")
    }), e.basura_tax && parseFloat(String(e.basura_tax)) > 0 && t.push({
      label: this.label("detail_basura_tax"),
      value: RealtySoftLabels.formatPrice(e.basura_tax) + this.label("detail_per_year")
    }), t.length === 0 ? "" : `
      <div class="rs-template__section rs-template__section--taxes">
        <h2 class="rs-template__section-title rs-template__section-title--taxes">${this.label("detail_taxes_fees")}</h2>
        <div class="rs-template__taxes">
          ${t.map((s) => `
            <div class="rs-template__tax-item">
              <span class="rs-template__tax-label">${s.label}</span>
              <span class="rs-template__tax-value">${s.value}</span>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }
  renderEnergy(e) {
    const t = e.energy_rating && (e.energy_rating.includes("http") || /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(e.energy_rating)), s = e.co2_rating && (e.co2_rating.includes("http") || /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(e.co2_rating)), i = t ? null : e.energy_rating, r = s ? null : e.co2_rating, a = [];
    return t && a.push(e.energy_rating), s && a.push(e.co2_rating), e.energy_certificate_image && a.push(e.energy_certificate_image), !i && !r && a.length === 0 ? "" : `
      <div class="rs-template__section rs-template__section--energy">
        <h2 class="rs-template__section-title rs-template__section-title--energy">${this.label("detail_energy_certificate")}</h2>
        <div class="rs-template__energy">
          ${i ? `
            <div class="rs-template__energy-rating">
              <span class="rs-template__energy-label rs-template__energy-label--rating">${this.label("detail_energy_rating")}</span>
              <span class="rs-template__energy-badge rs-template__energy-badge--${(i || "na").toLowerCase()}">${i || "N/A"}</span>
            </div>
          ` : ""}
          ${r ? `
            <div class="rs-template__energy-rating">
              <span class="rs-template__energy-label rs-template__energy-label--co2">${this.label("detail_co2_rating")}</span>
              <span class="rs-template__energy-badge rs-template__energy-badge--${(r || "na").toLowerCase()}">${r || "N/A"}</span>
            </div>
          ` : ""}
          ${a.map((l) => `
            <div class="rs-template__energy-image">
              <img src="${l}" alt="${this.label("detail_energy_certificate")}" loading="lazy">
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }
  renderSidebarPdf(e) {
    const t = e._original || {}, s = e.pdf_url || t.pdf_url || t.pdf || t.brochure_url || t.brochure || t.pdf_link || t.document_url || t.flyer_url || t.flyer || null;
    return s ? `
      <a href="${s}" target="_blank" rel="noopener" class="rs-template__sidebar-pdf">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <path d="M14 2v6h6"></path>
          <path d="M12 18v-6"></path>
          <path d="M9 15l3 3 3-3"></path>
        </svg>
        <span class="rs-template__sidebar-pdf-text">${this.label("detail_download_pdf") || "Download PDF"}</span>
      </a>
    ` : "";
  }
  renderAgentCard(e) {
    const t = e.agent;
    return !t || !t.name && !t.phone && !t.email ? "" : `
      <div class="rs-template__agent-card">
        ${t.photo ? `
          <div class="rs-template__agent-photo">
            <img src="${t.photo}" alt="${this.escapeHtml(t.name || "")}">
          </div>
        ` : ""}
        <div class="rs-template__agent-info">
          ${t.name ? `<div class="rs-template__agent-name">${this.escapeHtml(t.name)}</div>` : ""}
          ${t.phone ? `
            <a href="tel:${t.phone.replace(/\s/g, "")}" class="rs-template__agent-contact">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              ${t.phone}
            </a>
          ` : ""}
          ${t.email ? `
            <a href="mailto:${t.email}" class="rs-template__agent-contact">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              ${t.email}
            </a>
          ` : ""}
        </div>
      </div>
    `;
  }
  initChildComponents() {
    const e = this.property;
    if (!e) return;
    const t = [
      ["#rs-template-gallery", Ie],
      ["#rs-template-share", Be],
      ["#rs-template-wishlist", ze],
      ["#rs-template-map", Ae],
      ["#rs-template-inquiry", qe],
      ["#rs-template-related", De]
    ];
    for (const [s, i] of t) {
      const r = this.element.querySelector(s);
      r && !r._rsComponent && new i(r, { property: e });
    }
    this.initReadMore(), this.initFeaturesAccordion();
  }
  initReadMore() {
    const e = this.element.querySelector("#rs-template-description"), t = this.element.querySelector("#rs-template-read-more");
    !e || !t || requestAnimationFrame(() => {
      if (e.scrollHeight > e.clientHeight) {
        t.style.display = "";
        let i = !1;
        t.addEventListener("click", () => {
          i = !i, e.classList.toggle("rs-template__description--clamped", !i), t.textContent = i ? this.label("detail_read_less") || "Read Less" : this.label("detail_read_more") || "Read More";
        });
      }
    });
  }
  /**
   * Update only label text nodes on language change (preserves DOM structure and child components)
   */
  updateLabelsInPlace() {
    if (!this.property) return;
    const e = this.property, t = this.element.querySelector(".rs-template__price");
    t && (t.textContent = e.price_on_request ? this.label("detail_price_on_request") : RealtySoftLabels.formatPrice(e.price));
    const s = this.element.querySelectorAll(".rs-template__spec-label"), i = ["card_beds", "card_baths", "detail_built_area", "detail_plot_size"];
    s.forEach((f, u) => {
      i[u] && (f.textContent = this.label(i[u]));
    });
    const r = {
      description: "detail_description",
      "property-info": "detail_property_info",
      sizes: "detail_sizes",
      features: "detail_features",
      resources: "detail_additional_resources",
      taxes: "detail_taxes_fees",
      energy: "detail_energy_certificate"
    };
    for (const [f, u] of Object.entries(r)) {
      const b = this.element.querySelector(`.rs-template__section-title--${f}`);
      b && (b.textContent = this.label(u) || b.textContent);
    }
    const a = this.element.querySelector(".rs-template__read-more");
    if (a) {
      const f = this.element.querySelector("#rs-template-description"), u = f == null ? void 0 : f.classList.contains("rs-template__description--clamped");
      a.textContent = u ? this.label("detail_read_more") || "Read More" : this.label("detail_read_less") || "Read Less";
    }
    const l = this.element.querySelector(".rs-template__section--property-info");
    if (l) {
      const f = this.renderPropertyInfo(e);
      if (f) {
        const u = document.createElement("div");
        u.innerHTML = f;
        const b = u.firstElementChild;
        b && (l.innerHTML = b.innerHTML);
      }
    }
    const d = this.element.querySelector(".rs-template__section--sizes");
    if (d) {
      const f = this.renderAdditionalSizes(e);
      if (f) {
        const u = document.createElement("div");
        u.innerHTML = f;
        const b = u.firstElementChild;
        b && (d.innerHTML = b.innerHTML);
      }
    }
    const y = this.element.querySelector(".rs-template__section--taxes");
    if (y) {
      const f = this.renderTaxes(e);
      if (f) {
        const u = document.createElement("div");
        u.innerHTML = f;
        const b = u.firstElementChild;
        b && (y.innerHTML = b.innerHTML);
      }
    }
    const p = this.element.querySelector(".rs-template__energy-label--rating");
    p && (p.textContent = this.label("detail_energy_rating"));
    const S = this.element.querySelector(".rs-template__energy-label--co2");
    S && (S.textContent = this.label("detail_co2_rating"));
    const C = this.element.querySelector(".rs-template__resource--video .rs-template__resource-text");
    C && (C.textContent = this.label("detail_video_tour"));
    const k = this.element.querySelector(".rs-template__resource--virtual .rs-template__resource-text");
    k && (k.textContent = this.label("detail_virtual_tour"));
    const L = this.element.querySelector(".rs-template__sidebar-pdf-text");
    L && (L.textContent = this.label("detail_download_pdf") || "Download PDF");
  }
  renderFeatures(e) {
    const t = e.features;
    if (!t || t.length === 0) return "";
    const s = {};
    t.forEach((r) => {
      const a = typeof r == "string" ? r : r.name, l = typeof r == "object" && r.category ? r.category : "Features";
      s[l] || (s[l] = []), s[l].push(a);
    });
    const i = Object.entries(s);
    return `
      <div class="rs-template__section rs-template__section--features">
        <h2 class="rs-template__section-title rs-template__section-title--features">${this.label("detail_features") || "Features & Amenities"}</h2>
        <div class="rs-template__accordion">
          ${i.map(([r, a], l) => `
            <div class="rs-template__accordion-item${l === 0 ? " rs-template__accordion-item--open" : ""}">
              <button class="rs-template__accordion-header" type="button">
                <span class="rs-template__accordion-label">${this.escapeHtml(r)}</span>
                <span class="rs-template__accordion-count">${a.length}</span>
                <svg class="rs-template__accordion-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <div class="rs-template__accordion-body">
                <ul class="rs-template__accordion-list">
                  ${a.map((d) => `
                    <li class="rs-template__accordion-feature">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      ${this.escapeHtml(d)}
                    </li>
                  `).join("")}
                </ul>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }
  initFeaturesAccordion() {
    this.element.querySelectorAll(".rs-template__accordion-header").forEach((t) => {
      t.addEventListener("click", () => {
        const s = t.closest(".rs-template__accordion-item");
        s && s.classList.toggle("rs-template__accordion-item--open");
      });
    });
  }
  formatDescription(e) {
    return e ? /<[^>]+>/g.test(e) ? e : this.escapeHtml(e).replace(/\r\n/g, "<br>").replace(/\n/g, "<br>").replace(/\r/g, "<br>") : "";
  }
  escapeHtml(e) {
    if (!e) return "";
    const t = document.createElement("div");
    return t.textContent = e, t.innerHTML;
  }
}
RealtySoft.registerComponent("property-detail-container", Kt);
class Gt extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "propertyId", 0);
    o(this, "isInWishlist", !1);
    o(this, "btn", null);
    o(this, "icon", null);
    this.init();
  }
  init() {
    if (this.propertyId = parseInt(this.element.dataset.propertyId || "0"), !this.propertyId) {
      console.warn("Wishlist button requires data-property-id");
      return;
    }
    this.isInWishlist = RealtySoftState.isInWishlist(this.propertyId), this.render(), this.bindEvents(), this.subscribe("wishlist", () => {
      this.isInWishlist = RealtySoftState.isInWishlist(this.propertyId), this.updateDisplay();
    });
  }
  render() {
    this.element.classList.add("rs-wishlist-button"), this.element.innerHTML = `
      <button type="button"
              class="rs-wishlist-button__btn ${this.isInWishlist ? "rs-wishlist-button__btn--active" : ""}"
              aria-label="${this.isInWishlist ? this.label("wishlist_remove") : this.label("wishlist_add")}">
        <svg class="rs-wishlist-button__icon" width="20" height="20" viewBox="0 0 24 24"
             fill="${this.isInWishlist ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>
    `, this.btn = this.element.querySelector(".rs-wishlist-button__btn"), this.icon = this.element.querySelector(".rs-wishlist-button__icon");
  }
  bindEvents() {
    var e;
    (e = this.btn) == null || e.addEventListener("click", (t) => {
      t.preventDefault(), t.stopPropagation(), this.toggleWishlist();
    });
  }
  toggleWishlist() {
    this.isInWishlist ? (RealtySoftState.removeFromWishlist(this.propertyId), RealtySoftAnalytics.trackWishlistRemove(this.propertyId)) : (RealtySoftState.addToWishlist(this.propertyId), RealtySoftAnalytics.trackWishlistAdd(this.propertyId));
  }
  updateDisplay() {
    var e, t, s;
    (e = this.btn) == null || e.classList.toggle("rs-wishlist-button__btn--active", this.isInWishlist), (t = this.btn) == null || t.setAttribute("aria-label", this.isInWishlist ? this.label("wishlist_remove") : this.label("wishlist_add")), (s = this.icon) == null || s.setAttribute("fill", this.isInWishlist ? "currentColor" : "none");
  }
}
RealtySoft.registerComponent("rs_wishlist_button", Gt);
class Zt extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "count", 0);
    this.init();
  }
  init() {
    this.count = (RealtySoftState.get("wishlist") || []).length, this.render(), this.subscribe("wishlist", (e) => {
      this.count = e.length, this.updateDisplay();
    });
  }
  render() {
    this.element.classList.add("rs-wishlist-counter"), this.updateDisplay();
  }
  updateDisplay() {
    this.element.innerHTML = `
      <a href="${this.element.dataset.href || "/wishlist"}" class="rs-wishlist-counter__link">
        <svg class="rs-wishlist-counter__icon" width="24" height="24" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
        ${this.count > 0 ? `<span class="rs-wishlist-counter__badge">${this.count}</span>` : ""}
      </a>
    `;
  }
}
RealtySoft.registerComponent("rs_wishlist_counter", Zt);
class Fe extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "isSharedView", !1);
    o(this, "subtitleEl", null);
    this.init();
  }
  init() {
    this.isSharedView = I.isSharedView(), this.render(), this.bindEvents(), this.subscribe("config.language", () => {
      this.render(), this.bindEvents();
    });
  }
  render() {
    this.element.classList.add("rs-wishlist-header");
    const e = this.isSharedView ? this.label("wishlist_shared_title") || "Shared Wishlist" : this.label("wishlist_title") || "My Wishlist";
    this.element.innerHTML = `
      <h1 class="rs-wishlist-header__title">${e}</h1>
      <p class="rs-wishlist-header__subtitle">${this.label("results_loading") || "Loading..."}</p>
    `, this.subtitleEl = this.element.querySelector(".rs-wishlist-header__subtitle"), this.updateCount();
  }
  bindEvents() {
    window.addEventListener(I.EVENTS.CHANGED, () => {
      this.updateCount();
    });
  }
  updateCount() {
    let e;
    if (this.isSharedView) {
      const t = I.loadSharedWishlist();
      e = t ? t.length : 0;
    } else
      e = I.count();
    if (this.subtitleEl)
      if (e === 0)
        this.subtitleEl.textContent = this.label("wishlist_no_properties") || "No properties saved";
      else {
        const t = e === 1 ? this.label("property") || "property" : this.label("properties") || "properties", s = this.label("saved") || "saved";
        this.subtitleEl.textContent = `${e} ${t} ${s}`;
      }
  }
}
RealtySoft.registerComponent("rs_wishlist_header", Fe);
class He extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "isSharedView", !1);
    o(this, "titleEl", null);
    this.init();
  }
  init() {
    this.isSharedView = I.isSharedView(), this.render(), this.bindEvents(), this.updateVisibility(), this.subscribe("config.language", () => {
      this.render(), this.updateVisibility();
    });
  }
  render() {
    this.element.classList.add("rs-wishlist-empty");
    const e = this.isSharedView ? this.label("wishlist_shared_empty") || "No properties in shared wishlist" : this.label("wishlist_empty") || "Your wishlist is empty", t = this.isSharedView ? this.label("wishlist_shared_empty_desc") || "The shared link may be invalid or expired" : this.label("wishlist_empty_desc") || "Start adding properties by clicking the heart icon";
    this.element.innerHTML = `
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
      <h2 class="rs-wishlist-empty__title">${e}</h2>
      <p class="rs-wishlist-empty__desc">${t}</p>
      ${this.isSharedView ? "" : `
        <a href="/" class="rs-wishlist-btn rs-wishlist-btn--primary rs-wishlist-empty__browse">
          ${this.label("wishlist_browse") || "Browse Properties"}
        </a>
      `}
    `, this.titleEl = this.element.querySelector(".rs-wishlist-empty__title");
  }
  bindEvents() {
    window.addEventListener(I.EVENTS.CHANGED, () => {
      this.updateVisibility();
    });
  }
  updateVisibility() {
    let e;
    if (this.isSharedView) {
      const t = I.loadSharedWishlist();
      e = !t || t.length === 0;
    } else
      e = I.count() === 0;
    this.element.style.display = e ? "flex" : "none";
  }
  setMessage(e) {
    this.titleEl && e && (this.titleEl.textContent = e);
  }
}
RealtySoft.registerComponent("rs_wishlist_empty", He);
class Ve extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "isSharedView", !1);
    this.init();
  }
  init() {
    this.isSharedView = I.isSharedView(), this.render(), this.subscribe("config.language", () => {
      this.render();
    });
  }
  render() {
    if (this.element.classList.add("rs-wishlist-shared-banner"), !this.isSharedView) {
      this.element.style.display = "none";
      return;
    }
    this.element.innerHTML = `
      <span class="rs-wishlist-shared-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
      </span>
      <div class="rs-wishlist-shared-banner__content">
        <strong>${this.label("wishlist_shared_title") || "Viewing Shared Wishlist"}</strong>
        <p>${this.label("wishlist_shared_desc") || "This is a read-only view of saved properties"}</p>
      </div>
    `;
  }
  bindEvents() {
  }
}
RealtySoft.registerComponent("rs_wishlist_shared_banner", Ve);
class Ne extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "currentSort", "addedAt-desc");
    o(this, "selectEl", null);
    this.init();
  }
  init() {
    this.currentSort = "addedAt-desc", this.render(), this.bindEvents(), this.updateVisibility(), this.subscribe("config.language", () => {
      const e = this.currentSort;
      this.render(), this.bindEvents(), this.setValue(e);
    });
  }
  render() {
    this.element.classList.add("rs-wishlist-sort-wrapper"), this.element.innerHTML = `
      <label class="rs-wishlist-sort-label" for="rs-wishlist-sort">
        ${this.label("sort_by") || "Sort by:"}
      </label>
      <select class="rs-wishlist-sort" id="rs-wishlist-sort">
        <option value="addedAt-desc">${this.label("sort_recent") || "Recently Added"}</option>
        <option value="addedAt-asc">${this.label("sort_oldest") || "Oldest First"}</option>
        <option value="price-desc">${this.label("sort_price_desc") || "Price: High to Low"}</option>
        <option value="price-asc">${this.label("sort_price_asc") || "Price: Low to High"}</option>
        <option value="title-asc">${this.label("sort_name") || "Name: A-Z"}</option>
        <option value="location-asc">${this.label("sort_location") || "Location: A-Z"}</option>
      </select>
    `, this.selectEl = this.element.querySelector(".rs-wishlist-sort");
  }
  bindEvents() {
    var e;
    (e = this.selectEl) == null || e.addEventListener("change", (t) => {
      const s = t.target;
      this.currentSort = s.value;
      const [i, r] = this.currentSort.split("-"), l = { price: "list_price", title: "name" }[i] || i;
      I.setSort(l, r);
    }), window.addEventListener(I.EVENTS.CHANGED, () => {
      this.updateVisibility();
    });
  }
  updateVisibility() {
    const e = I.count();
    this.element.style.display = e > 0 ? "" : "none";
  }
  getValue() {
    return this.currentSort;
  }
  setValue(e) {
    this.currentSort = e, this.selectEl && (this.selectEl.value = e);
  }
}
RealtySoft.registerComponent("rs_wishlist_sort", Ne);
class je extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "isSharedView", !1);
    this.init();
  }
  init() {
    this.isSharedView = I.isSharedView(), this.render(), this.bindEvents(), this.updateVisibility(), this.subscribe("config.language", () => {
      this.render(), this.bindEvents(), this.updateVisibility();
    });
  }
  render() {
    if (this.element.classList.add("rs-wishlist-actions"), this.isSharedView) {
      this.element.style.display = "none";
      return;
    }
    this.element.innerHTML = `
      <div class="rs-wishlist-actions__left">
        <button type="button" class="rs-wishlist-btn rs-wishlist-btn--secondary rs-wishlist-back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          ${this.label("detail_back") || "Back"}
        </button>
        <button type="button" class="rs-wishlist-btn rs-wishlist-btn--danger rs-wishlist-clear">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          ${this.label("wishlist_clear") || "Clear All"}
        </button>
      </div>
      <div class="rs-wishlist-actions__right">
        <button type="button" class="rs-wishlist-btn rs-wishlist-btn--warning rs-wishlist-pdf">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
          ${this.label("wishlist_pdf") || "Download PDF"}
        </button>
        <button type="button" class="rs-wishlist-btn rs-wishlist-btn--primary rs-wishlist-share">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
          ${this.label("wishlist_share") || "Share"}
        </button>
        <button type="button" class="rs-wishlist-btn rs-wishlist-btn--success rs-wishlist-email">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          ${this.label("wishlist_email") || "Email"}
        </button>
      </div>
    `;
  }
  bindEvents() {
    var e, t, s, i, r;
    this.isSharedView || ((e = this.element.querySelector(".rs-wishlist-back")) == null || e.addEventListener("click", () => {
      window.history.back();
    }), (t = this.element.querySelector(".rs-wishlist-clear")) == null || t.addEventListener("click", () => {
      this.clearWishlist();
    }), (s = this.element.querySelector(".rs-wishlist-pdf")) == null || s.addEventListener("click", () => {
      I.openModal("pdf");
    }), (i = this.element.querySelector(".rs-wishlist-share")) == null || i.addEventListener("click", () => {
      I.openModal("share");
    }), (r = this.element.querySelector(".rs-wishlist-email")) == null || r.addEventListener("click", () => {
      I.openModal("email");
    }), window.addEventListener(I.EVENTS.CHANGED, () => {
      this.updateVisibility();
    }));
  }
  clearWishlist() {
    confirm(this.label("wishlist_confirm_clear") || "Are you sure you want to clear your entire wishlist?") && (I.clear(), typeof RealtySoftToast < "u" && RealtySoftToast && RealtySoftToast.success(this.label("wishlist_cleared") || "Wishlist cleared"));
  }
  updateVisibility() {
    if (this.isSharedView) {
      this.element.style.display = "none";
      return;
    }
    const e = I.count();
    this.element.style.display = e > 0 ? "flex" : "none";
  }
}
RealtySoft.registerComponent("rs_wishlist_actions", je);
class Oe extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "isSharedView", !1);
    o(this, "countEl", null);
    this.init();
  }
  init() {
    this.isSharedView = I.isSharedView(), this.render(), this.bindEvents(), this.updateDisplay(), this.subscribe("config.language", () => {
      this.render(), this.bindEvents(), this.updateDisplay();
    });
  }
  render() {
    if (this.element.classList.add("rs-wishlist-compare-float"), this.isSharedView) {
      this.element.style.display = "none";
      return;
    }
    this.element.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="20" x2="18" y2="10"></line>
        <line x1="12" y1="20" x2="12" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="14"></line>
      </svg>
      <span class="rs-wishlist-compare-float__label">${this.label("wishlist_compare") || "Compare"}</span>
      <span class="rs-wishlist-compare-count">0</span>
    `, this.countEl = this.element.querySelector(".rs-wishlist-compare-count");
  }
  bindEvents() {
    this.isSharedView || (this.element.addEventListener("click", () => {
      this.openCompareModal();
    }), window.addEventListener(I.EVENTS.COMPARE_CHANGED, () => {
      this.updateDisplay();
    }));
  }
  openCompareModal() {
    if (I.getCompareCount() < 2) {
      typeof RealtySoftToast < "u" && RealtySoftToast && RealtySoftToast.warning(this.label("compare_min") || "Select at least 2 properties to compare");
      return;
    }
    I.openModal("compare");
  }
  updateDisplay() {
    if (this.isSharedView) return;
    const e = I.getCompareCount();
    this.countEl && (this.countEl.textContent = String(e)), e > 0 ? (this.element.style.display = "flex", setTimeout(() => this.element.classList.add("visible"), 10)) : (this.element.classList.remove("visible"), setTimeout(() => {
      I.getCompareCount() === 0 && (this.element.style.display = "none");
    }, 300));
  }
  getCount() {
    return I.getCompareCount();
  }
}
RealtySoft.registerComponent("rs_wishlist_compare_btn", Oe);
class We extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "properties", []);
    o(this, "isSharedView", !1);
    o(this, "sharedRefNos", []);
    o(this, "isLoading", !0);
    o(this, "compareEnabled", !1);
    o(this, "template", null);
    this.init();
  }
  init() {
    this.properties = [], this.isSharedView = I.isSharedView(), this.sharedRefNos = this.isSharedView ? I.loadSharedWishlist() || [] : [], this.isLoading = !0, this.compareEnabled = this.checkCompareEnabled(), this.template = this.element.dataset.template || null, this.render(), this.bindEvents(), this.loadProperties(), this.subscribe("config.language", () => {
      this.properties.length > 0 && !this.isLoading && this.renderProperties();
    });
  }
  checkCompareEnabled() {
    const e = document.querySelector(".rs_wishlist_compare_btn, .rs-wishlist-compare-float"), t = this.element.closest(".rs_wishlist_list, .rs-wishlist-list");
    return !!(e || t);
  }
  render() {
    this.element.classList.add("rs-wishlist-list__grid"), this.template && this.element.classList.add(`rs-wishlist-template-${this.template}`), this.element.innerHTML = `
      <div class="rs-wishlist-grid__loading">
        <div class="rs-wishlist-list__spinner"></div>
        <p>${this.label("results_loading") || "Loading..."}</p>
      </div>
    `;
  }
  bindEvents() {
    this.isSharedView || window.addEventListener(I.EVENTS.CHANGED, () => {
      this.loadProperties();
    }), window.addEventListener(I.EVENTS.SORTED, () => {
      this.sortAndRender();
    }), window.addEventListener(I.EVENTS.COMPARE_CHANGED, () => {
      this.updateCompareCheckboxes();
    }), this.element.addEventListener("click", (e) => this.handleCardClick(e));
  }
  async loadProperties() {
    this.isLoading = !0, this.isSharedView ? await this.loadSharedProperties() : this.loadOwnWishlist();
  }
  loadOwnWishlist() {
    const e = I.getSort(), t = I.getAsArray(e.field, e.order);
    this.properties = t, this.properties.length === 0 ? this.element.style.display = "none" : (this.element.style.display = "grid", this.renderProperties()), this.isLoading = !1, this.properties.forEach((s) => {
      RealtySoftAnalytics.track("wishlist", "viewed", { property_id: s.ref_no });
    });
  }
  async loadSharedProperties() {
    var e, t;
    try {
      const s = [];
      for (const i of this.sharedRefNos)
        try {
          const r = await RealtySoftAPI.request("v1/property", { ref_no: i });
          if (r && r.data && r.data.length > 0) {
            const a = r.data[0];
            s.push({
              id: a.id,
              ref_no: a.ref_no || i,
              ref: a.ref_no || i,
              name: a.name || "Property",
              title: a.name || "Property",
              list_price: Number(a.list_price) || 0,
              price: Number(a.list_price) || 0,
              location: ((e = a.location_id) == null ? void 0 : e.name) || "N/A",
              type: ((t = a.type_id) == null ? void 0 : t.name) || "N/A",
              bedrooms: Number(a.bedrooms) || 0,
              beds: Number(a.bedrooms) || 0,
              bathrooms: Number(a.bathrooms) || 0,
              baths: Number(a.bathrooms) || 0,
              build_size: Number(a.build_size) || 0,
              built_area: Number(a.build_size) || 0,
              plot_size: Number(a.plot_size) || 0,
              images: a.images || [],
              listing_type: a.listing_type || "resale",
              is_featured: a.is_featured || !1,
              is_own: a.is_own || !1
            });
          }
        } catch (r) {
          console.warn(`[Wishlist] Could not load property ${i}:`, r);
        }
      this.properties = s, s.length === 0 ? this.element.style.display = "none" : (this.element.style.display = "grid", this.renderProperties()), this.isLoading = !1;
    } catch (s) {
      console.error("[Wishlist] Error loading shared wishlist:", s), this.isLoading = !1;
    }
  }
  sortAndRender() {
    if (this.isSharedView) return;
    const e = I.getSort(), t = I.getAsArray(e.field, e.order);
    this.properties = t, this.renderProperties();
  }
  renderProperties() {
    this.element.innerHTML = this.properties.map((e) => this.createCard(e)).join("");
  }
  createCard(e) {
    let t = [];
    e.images && Array.isArray(e.images) ? t = e.images.slice(0, 5).map((p) => typeof p == "string" ? p : p.image_256 || p.src || "").filter(Boolean) : e.image && (t = [e.image]);
    const s = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="256" height="192"%3E%3Crect fill="%23ecf0f1" width="256" height="192"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23bdc3c7" font-family="sans-serif" font-size="16"%3ENo Image%3C/text%3E%3C/svg%3E', i = this.formatPrice(e), r = this.generatePropertyUrl(e), a = e.addedAt ? new Date(e.addedAt).toLocaleDateString() : "", l = e.ref_no || e.ref || String(e.id), d = I.isInCompare(l), y = this.generateTags(e);
    return `
      <div class="rs-wishlist-card" data-ref-no="${l}">
        <div class="rs-wishlist-card__carousel">
          ${y}
          ${this.isSharedView ? "" : `
            ${this.compareEnabled ? `
              <div class="rs-wishlist-card__compare">
                <input type="checkbox" id="compare-${l}" class="rs-compare-check" ${d ? "checked" : ""}>
                <label for="compare-${l}">${this.label("compare") || "Compare"}</label>
              </div>
            ` : ""}
            <button type="button" class="rs-wishlist-card__heart active" data-action="remove">
              <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
          `}
          <a href="${r}" class="rs-wishlist-card__carousel-link">
            <div class="rs-wishlist-card__carousel-track">
              ${t.length > 0 ? t.map((p, S) => `<img src="${p}" alt="${this.escapeHtml(e.name || e.title)} - ${S + 1}" ${S === 0 ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'} onerror="this.src='${s}'">`).join("") : `<img src="${s}" alt="No image">`}
            </div>
          </a>
          ${t.length > 1 ? `
            <button type="button" class="rs-wishlist-card__nav rs-wishlist-card__nav--prev" data-action="prev">&#8249;</button>
            <button type="button" class="rs-wishlist-card__nav rs-wishlist-card__nav--next" data-action="next">&#8250;</button>
            <div class="rs-wishlist-card__indicators">
              ${t.map((p, S) => `<span class="${S === 0 ? "active" : ""}"></span>`).join("")}
            </div>
          ` : ""}
          ${(e.image_count || t.length) > 0 ? `
            <div class="rs-wishlist-card__img-count">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <span>${e.image_count || t.length}</span>
            </div>
          ` : ""}
        </div>
        <div class="rs-wishlist-card__content">
          <a href="${r}" class="rs-wishlist-card__title">${this.escapeHtml(e.name || e.title)}</a>
          <a href="${r}" class="rs-wishlist-card__price">${i}</a>
          <div class="rs-wishlist-card__details">
            <span>${this.escapeHtml(e.location || "N/A")}</span>
            <span>${this.escapeHtml(e.type || "N/A")}</span>
            <span>${e.beds || e.bedrooms || 0} ${this.label("card_beds") || "beds"}</span>
            <span>${e.baths || e.bathrooms || 0} ${this.label("card_baths") || "baths"}</span>
            <span>${e.built || e.build_size || e.built_area || 0}m²</span>
          </div>
          ${a ? `<div class="rs-wishlist-card__added">${this.label("added") || "Added"}: ${a}</div>` : ""}
          ${e.note ? `
            <div class="rs-wishlist-card__note">
              <strong>📝 ${this.label("note") || "Note"}:</strong> ${this.escapeHtml(e.note)}
            </div>
          ` : this.isSharedView ? "" : `
            <button type="button" class="rs-wishlist-card__add-note" data-action="addNote">📝 ${this.label("wishlist_add_note") || "Add Note"}</button>
          `}
          <div class="rs-wishlist-card__footer">
            <span class="rs-wishlist-card__ref">Ref: ${l}</span>
            <a href="${r}" class="rs-wishlist-card__view">${this.label("view_details") || "View Details"}</a>
          </div>
        </div>
      </div>
    `;
  }
  generateTags(e) {
    const t = [], s = e.listing_type || e.status;
    if (s) {
      const i = {
        resale: "rs-tag--sale",
        sale: "rs-tag--sale",
        development: "rs-tag--development",
        new_development: "rs-tag--development",
        long_rental: "rs-tag--rental",
        rent: "rs-tag--rental",
        short_rental: "rs-tag--holiday",
        holiday: "rs-tag--holiday"
      }, r = {
        resale: "listing_type_sale",
        sale: "listing_type_sale",
        development: "listing_type_new",
        new_development: "listing_type_new",
        long_rental: "listing_type_long_rental",
        rent: "listing_type_long_rental",
        short_rental: "listing_type_short_rental",
        holiday: "listing_type_short_rental"
      }, a = s.toLowerCase(), l = i[a] || "rs-tag--sale", d = r[a], y = d ? this.label(d) : s;
      t.push(`<span class="rs-tag ${l}">${y}</span>`);
    }
    return e.is_featured && t.push(`<span class="rs-tag rs-tag--featured">${this.label("featured") || "Featured"}</span>`), e.is_own && t.push(`<span class="rs-tag rs-tag--own">${this.label("own") || "Own"}</span>`), t.length > 0 ? `<div class="rs-wishlist-card__tags">${t.join("")}</div>` : "";
  }
  formatPrice(e) {
    const t = Number(e.list_price || e.price || 0), s = Number(e.list_price_2 || 0);
    return s && t !== s ? `€${t.toLocaleString()} - €${s.toLocaleString()}` : `€${t.toLocaleString()}`;
  }
  generatePropertyUrl(e) {
    if (e.url) return e.url;
    const t = RealtySoftState.get("config.propertyPageSlug") || "property", s = e.ref_no || e.ref || String(e.id), r = (e.name || e.title || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").substring(0, 80);
    return `/${t}/${r}-${s}`;
  }
  handleCardClick(e) {
    const t = e.target.closest(".rs-wishlist-card");
    if (!t) return;
    const s = t.dataset.refNo || "", i = e.target.closest("[data-action]"), r = i == null ? void 0 : i.dataset.action;
    if (r === "remove") {
      e.preventDefault(), e.stopPropagation(), confirm(this.label("wishlist_confirm_remove") || "Remove this property from your wishlist?") && (I.remove(s), RealtySoftAnalytics.track("wishlist", "removed", { property_id: s }), typeof RealtySoftToast < "u" && RealtySoftToast && RealtySoftToast.success(this.label("wishlist_removed") || "Removed from wishlist"));
      return;
    }
    if (r === "addNote") {
      e.preventDefault(), e.stopPropagation(), I.openModal("note", { refNo: s });
      return;
    }
    if (r === "prev" || r === "next") {
      e.preventDefault(), e.stopPropagation(), this.navigateCarousel(t, r);
      return;
    }
    const a = e.target.closest(".rs-compare-check");
    if (a) {
      this.handleCompareToggle(s, a.checked);
      return;
    }
  }
  navigateCarousel(e, t) {
    const s = e.querySelector(".rs-wishlist-card__carousel-track"), i = e.querySelectorAll(".rs-wishlist-card__indicators span"), r = s == null ? void 0 : s.querySelectorAll("img");
    if (!s || !r || r.length <= 1) return;
    let a = Array.from(i).findIndex((d) => d.classList.contains("active"));
    a === -1 && (a = 0);
    const l = t === "next" ? (a + 1) % r.length : (a - 1 + r.length) % r.length;
    s.style.transform = `translateX(-${l * 100}%)`, i.forEach((d, y) => {
      d.classList.toggle("active", y === l);
    });
  }
  handleCompareToggle(e, t) {
    if (t) {
      if (!I.addToCompare(e)) {
        if (typeof RealtySoftToast < "u" && RealtySoftToast) {
          const r = I.getMaxCompare();
          RealtySoftToast.warning(`${this.label("compare_max") || "Maximum"} ${r} ${this.label("properties") || "properties"}`);
        }
        const i = this.element.querySelector(`#compare-${e}`);
        i && (i.checked = !1);
      }
    } else
      I.removeFromCompare(e);
  }
  updateCompareCheckboxes() {
    this.element.querySelectorAll(".rs-compare-check").forEach((e) => {
      const t = e.id.replace("compare-", "");
      e.checked = I.isInCompare(t);
    });
  }
  escapeHtml(e) {
    if (!e) return "";
    const t = document.createElement("div");
    return t.textContent = e, t.innerHTML;
  }
  getProperties() {
    return this.properties;
  }
}
RealtySoft.registerComponent("rs_wishlist_grid", We);
class Ue extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "currentNoteRefNo", null);
    o(this, "shareModal", null);
    o(this, "emailModal", null);
    o(this, "noteModal", null);
    o(this, "compareModal", null);
    this.init();
  }
  init() {
    this.currentNoteRefNo = null, this.render(), this.bindEvents(), this.subscribe("config.language", () => {
      this.render(), this.bindEvents();
    });
  }
  render() {
    this.element.classList.add("rs-wishlist-modals"), this.element.innerHTML = `
      <!-- Share Modal -->
      <div class="rs-modal" id="rs-share-modal">
        <div class="rs-modal__backdrop"></div>
        <div class="rs-modal__content">
          <div class="rs-modal__header">
            <h3>${this.label("wishlist_share_title") || "Share Your Wishlist"}</h3>
            <button type="button" class="rs-modal__close">&times;</button>
          </div>
          <div class="rs-modal__body">
            <p class="rs-modal__desc">${this.label("wishlist_share_desc") || "Share this link with anyone to show them your saved properties:"}</p>
            <div class="rs-share-link">
              <input type="text" class="rs-share-link__input" readonly>
              <button type="button" class="rs-wishlist-btn rs-wishlist-btn--primary rs-share-link__copy">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                ${this.label("copy") || "Copy"}
              </button>
            </div>
            <div class="rs-share-social">
              <button type="button" class="rs-share-social__btn rs-share-social__btn--whatsapp" data-platform="whatsapp">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                WhatsApp
              </button>
              <button type="button" class="rs-share-social__btn rs-share-social__btn--email" data-platform="email">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                Email
              </button>
              <button type="button" class="rs-share-social__btn rs-share-social__btn--qr" data-platform="qr">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                QR Code
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Email Modal -->
      <div class="rs-modal" id="rs-email-modal">
        <div class="rs-modal__backdrop"></div>
        <div class="rs-modal__content">
          <div class="rs-modal__header">
            <h3>${this.label("wishlist_email_title") || "Email Your Wishlist"}</h3>
            <button type="button" class="rs-modal__close">&times;</button>
          </div>
          <div class="rs-modal__body">
            <form class="rs-email-form">
              <div class="rs-form-group">
                <label>${this.label("wishlist_email_to") || "Send to:"}</label>
                <input type="email" name="emailTo" class="rs-input" placeholder="recipient@example.com" required>
              </div>
              <div class="rs-form-group">
                <label>${this.label("wishlist_email_from") || "Your email (optional):"}</label>
                <input type="email" name="emailFrom" class="rs-input" placeholder="your@example.com">
              </div>
              <div class="rs-form-group">
                <label>${this.label("wishlist_email_message") || "Personal message (optional):"}</label>
                <textarea name="message" class="rs-textarea" rows="4" placeholder="${this.label("wishlist_email_placeholder") || "Add a personal note..."}"></textarea>
              </div>
              <div class="rs-form-actions">
                <button type="button" class="rs-wishlist-btn rs-wishlist-btn--secondary rs-email-cancel">${this.label("cancel") || "Cancel"}</button>
                <button type="submit" class="rs-wishlist-btn rs-wishlist-btn--success">${this.label("wishlist_email_send") || "Send Email"}</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Note Modal -->
      <div class="rs-modal" id="rs-note-modal">
        <div class="rs-modal__backdrop"></div>
        <div class="rs-modal__content">
          <div class="rs-modal__header">
            <h3>${this.label("wishlist_note_title") || "Add Property Note"}</h3>
            <button type="button" class="rs-modal__close">&times;</button>
          </div>
          <div class="rs-modal__body">
            <form class="rs-note-form">
              <input type="hidden" name="refNo" class="rs-note-refno">
              <div class="rs-form-group">
                <label>${this.label("property") || "Property:"}</label>
                <div class="rs-note-property-name"></div>
              </div>
              <div class="rs-form-group">
                <label>${this.label("wishlist_note_label") || "Your note:"}</label>
                <textarea name="note" class="rs-textarea rs-note-text" rows="6" placeholder="${this.label("wishlist_note_placeholder") || "Add your thoughts, questions, or reminders..."}" maxlength="500"></textarea>
                <div class="rs-char-counter"><span class="rs-note-char-count">0</span> / 500</div>
              </div>
              <div class="rs-form-actions">
                <button type="button" class="rs-wishlist-btn rs-wishlist-btn--secondary rs-note-cancel">${this.label("cancel") || "Cancel"}</button>
                <button type="button" class="rs-wishlist-btn rs-wishlist-btn--danger rs-note-delete" style="display: none;">${this.label("delete") || "Delete"}</button>
                <button type="submit" class="rs-wishlist-btn rs-wishlist-btn--success">${this.label("save") || "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Compare Modal -->
      <div class="rs-modal rs-modal--large" id="rs-compare-modal">
        <div class="rs-modal__backdrop"></div>
        <div class="rs-modal__content">
          <div class="rs-modal__header">
            <h3>${this.label("wishlist_compare_title") || "Compare Properties"}</h3>
            <button type="button" class="rs-modal__close">&times;</button>
          </div>
          <div class="rs-modal__body">
            <div class="rs-compare-grid"></div>
            <div class="rs-compare-table-wrap">
              <table class="rs-compare-table">
                <thead><tr><th>${this.label("feature") || "Feature"}</th></tr></thead>
                <tbody></tbody>
              </table>
            </div>
          </div>
          <div class="rs-modal__footer">
            <button type="button" class="rs-wishlist-btn rs-wishlist-btn--secondary rs-compare-close">${this.label("close") || "Close"}</button>
            <button type="button" class="rs-wishlist-btn rs-wishlist-btn--danger rs-compare-clear">${this.label("wishlist_compare_clear") || "Clear Selection"}</button>
          </div>
        </div>
      </div>
    `, this.shareModal = this.element.querySelector("#rs-share-modal"), this.emailModal = this.element.querySelector("#rs-email-modal"), this.noteModal = this.element.querySelector("#rs-note-modal"), this.compareModal = this.element.querySelector("#rs-compare-modal");
  }
  bindEvents() {
    var t, s, i, r, a, l, d, y;
    window.addEventListener(I.EVENTS.MODAL_OPEN, (p) => {
      this.handleModalOpen(p.detail.modalType, p.detail.data);
    }), window.addEventListener(I.EVENTS.MODAL_CLOSE, (p) => {
      this.closeModal(p.detail.modalType);
    }), this.element.querySelectorAll(".rs-modal__backdrop, .rs-modal__close").forEach((p) => {
      p.addEventListener("click", (S) => {
        const C = S.target.closest(".rs-modal");
        C && (C.classList.remove("rs-modal--open"), document.body.style.overflow = "");
      });
    }), (t = this.element.querySelector(".rs-share-link__copy")) == null || t.addEventListener("click", () => this.copyShareLink()), this.element.querySelectorAll(".rs-share-social__btn").forEach((p) => {
      p.addEventListener("click", () => this.handleSocialShare(p.dataset.platform || ""));
    }), (s = this.element.querySelector(".rs-email-form")) == null || s.addEventListener("submit", (p) => this.handleEmailSubmit(p)), (i = this.element.querySelector(".rs-email-cancel")) == null || i.addEventListener("click", () => this.closeModalById("rs-email-modal"));
    const e = this.element.querySelector(".rs-note-text");
    e == null || e.addEventListener("input", () => {
      const p = this.element.querySelector(".rs-note-char-count");
      p && (p.textContent = String(e.value.length));
    }), (r = this.element.querySelector(".rs-note-form")) == null || r.addEventListener("submit", (p) => this.handleNoteSubmit(p)), (a = this.element.querySelector(".rs-note-cancel")) == null || a.addEventListener("click", () => this.closeModalById("rs-note-modal")), (l = this.element.querySelector(".rs-note-delete")) == null || l.addEventListener("click", () => this.deleteNote()), (d = this.element.querySelector(".rs-compare-close")) == null || d.addEventListener("click", () => this.closeModalById("rs-compare-modal")), (y = this.element.querySelector(".rs-compare-clear")) == null || y.addEventListener("click", () => this.clearCompare());
  }
  handleModalOpen(e, t = {}) {
    switch (e) {
      case "share":
        this.openShareModal();
        break;
      case "email":
        this.openEmailModal();
        break;
      case "note":
        this.openNoteModal(t.refNo);
        break;
      case "compare":
        this.openCompareModal();
        break;
      case "pdf":
        this.downloadPDF();
        break;
    }
  }
  closeModal(e) {
    const s = {
      share: "rs-share-modal",
      email: "rs-email-modal",
      note: "rs-note-modal",
      compare: "rs-compare-modal"
    }[e];
    s && this.closeModalById(s);
  }
  openModalById(e) {
    const t = this.element.querySelector(`#${e}`);
    t && (t.classList.add("rs-modal--open"), document.body.style.overflow = "hidden");
  }
  closeModalById(e) {
    const t = this.element.querySelector(`#${e}`);
    t && (t.classList.remove("rs-modal--open"), document.body.style.overflow = "");
  }
  // Share functionality
  openShareModal() {
    const e = I.generateShareLink();
    if (!e) {
      typeof RealtySoftToast < "u" && RealtySoftToast && RealtySoftToast.error(this.label("wishlist_no_share") || "No properties to share");
      return;
    }
    const t = this.element.querySelector(".rs-share-link__input");
    t && (t.value = e), this.openModalById("rs-share-modal");
  }
  copyShareLink() {
    const e = this.element.querySelector(".rs-share-link__input");
    e && (e.select(), document.execCommand("copy")), typeof RealtySoftToast < "u" && RealtySoftToast && RealtySoftToast.success(this.label("copied") || "Link copied to clipboard!"), RealtySoftAnalytics.track("wishlist", "share", { method: "copy" });
  }
  handleSocialShare(e) {
    const t = I.generateShareLink();
    if (e === "whatsapp") {
      const s = encodeURIComponent(`Check out my property wishlist: ${t}`);
      window.open(`https://wa.me/?text=${s}`, "_blank"), RealtySoftAnalytics.track("wishlist", "share", { method: "whatsapp" });
    } else if (e === "email")
      this.closeModalById("rs-share-modal"), setTimeout(() => this.openEmailModal(), 300);
    else if (e === "qr") {
      const s = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(t || "")}`;
      window.open(s, "_blank"), RealtySoftAnalytics.track("wishlist", "share", { method: "qr" });
    }
  }
  // Email functionality
  openEmailModal() {
    this.openModalById("rs-email-modal");
  }
  async handleEmailSubmit(e) {
    e.preventDefault();
    const t = e.target, s = t.elements.namedItem("emailTo").value.trim(), i = t.elements.namedItem("emailFrom").value.trim(), r = t.elements.namedItem("message").value.trim();
    if (!s) {
      typeof RealtySoftToast < "u" && RealtySoftToast && RealtySoftToast.error("Please enter recipient email");
      return;
    }
    const a = RealtySoftState.get("config.phpBase") || "https://realtysoft.ai/propertymanager/php", l = RealtySoftState.get("config.wishlistEmailEndpoint") || `${a}/send-wishlist-email.php`, d = t.querySelector('button[type="submit"]'), y = (d == null ? void 0 : d.innerHTML) || "";
    d && (d.disabled = !0, d.innerHTML = this.label("inquiry_sending") || "Sending...");
    const p = I.getAsArray(), S = p.map((C) => ({
      ...C,
      propertyUrl: window.location.origin + this.generatePropertyUrl(C)
    }));
    try {
      const C = await fetch(l, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          emailTo: s,
          emailFrom: i || "noreply@realtysoft.ai",
          message: r,
          wishlist: S,
          siteUrl: window.location.origin,
          ownerEmail: RealtySoftState.get("config.ownerEmail") || ""
        })
      }), k = await C.text();
      if (!k || k.trim() === "")
        throw new Error("Server returned empty response");
      if (k.trim().startsWith("<!DOCTYPE") || k.trim().startsWith("<html"))
        throw new Error("Email endpoint not found");
      if (!C.ok)
        throw new Error(`HTTP error! status: ${C.status}`);
      const L = JSON.parse(k);
      L.success ? (typeof RealtySoftToast < "u" && RealtySoftToast && RealtySoftToast.success(this.label("wishlist_email_sent") || "Email sent successfully!"), this.closeModalById("rs-email-modal"), t.reset(), p.forEach((f) => {
        RealtySoftAnalytics.track("wishlist", "emailed", { property_id: f.ref_no });
      })) : typeof RealtySoftToast < "u" && RealtySoftToast && RealtySoftToast.error(L.message || this.label("wishlist_email_error") || "Failed to send email");
    } catch (C) {
      console.error("[Wishlist Email] Error:", C), typeof RealtySoftToast < "u" && RealtySoftToast && RealtySoftToast.error("Email failed: " + C.message);
    } finally {
      d && (d.disabled = !1, d.innerHTML = y);
    }
  }
  generatePropertyUrl(e) {
    const t = e;
    if (t.url) return t.url;
    const s = RealtySoftState.get("config.propertyPageSlug") || "property", i = t.ref_no || t.ref || t.id || "", a = (t.name || t.title || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").substring(0, 80);
    return `/${s}/${a}-${i}`;
  }
  // Note functionality
  openNoteModal(e) {
    const t = I.get(e);
    if (!t || (this.currentNoteRefNo = e, !this.noteModal)) return;
    const s = this.noteModal, i = s.querySelector(".rs-note-refno");
    i && (i.value = e);
    const r = s.querySelector(".rs-note-property-name");
    r && (r.textContent = t.title || "Property");
    const a = s.querySelector(".rs-note-text");
    a && (a.value = t.note || "");
    const l = s.querySelector(".rs-note-char-count");
    l && (l.textContent = String((t.note || "").length));
    const d = s.querySelector(".rs-note-delete");
    d && (d.style.display = t.note ? "inline-flex" : "none"), this.openModalById("rs-note-modal");
  }
  handleNoteSubmit(e) {
    var r, a;
    e.preventDefault();
    const t = e.target, s = ((r = t.querySelector(".rs-note-refno")) == null ? void 0 : r.value) || "", i = ((a = t.querySelector(".rs-note-text")) == null ? void 0 : a.value.trim()) || "";
    I.updateNote(s, i) && (typeof RealtySoftToast < "u" && RealtySoftToast && RealtySoftToast.success(this.label("note_saved") || "Note saved!"), this.closeModalById("rs-note-modal"));
  }
  deleteNote() {
    var t;
    const e = ((t = this.element.querySelector(".rs-note-refno")) == null ? void 0 : t.value) || "";
    confirm(this.label("confirm_delete_note") || "Delete this note?") && (I.updateNote(e, ""), typeof RealtySoftToast < "u" && RealtySoftToast && RealtySoftToast.success(this.label("note_deleted") || "Note deleted"), this.closeModalById("rs-note-modal"));
  }
  // Compare functionality
  openCompareModal() {
    if (I.getCompareCount() < 2) {
      typeof RealtySoftToast < "u" && RealtySoftToast && RealtySoftToast.warning(this.label("compare_min") || "Select at least 2 properties to compare");
      return;
    }
    const t = I.getCompareProperties();
    this.renderComparePreview(t), this.renderCompareTable(t), this.openModalById("rs-compare-modal");
  }
  renderComparePreview(e) {
    const t = this.element.querySelector(".rs-compare-grid");
    if (!t) return;
    const s = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="256" height="192"%3E%3Crect fill="%23ecf0f1" width="256" height="192"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23bdc3c7" font-family="sans-serif" font-size="16"%3ENo Image%3C/text%3E%3C/svg%3E';
    t.innerHTML = e.map((i) => {
      const r = i.image || s;
      return `
        <div class="rs-compare-card">
          <button type="button" class="rs-compare-card__remove" data-ref="${i.ref_no}">&times;</button>
          <img src="${r}" alt="${this.escapeHtml(i.title)}" onerror="this.src='${s}'">
          <div class="rs-compare-card__info">
            <h4>${this.escapeHtml(i.title)}</h4>
            <div class="rs-compare-card__price">${this.formatPrice(i)}</div>
            <div class="rs-compare-card__location">${this.escapeHtml(i.location)}</div>
          </div>
        </div>
      `;
    }).join(""), t.querySelectorAll(".rs-compare-card__remove").forEach((i) => {
      i.addEventListener("click", () => {
        const r = i.dataset.ref || "";
        I.removeFromCompare(r), I.getCompareCount() < 2 ? this.closeModalById("rs-compare-modal") : this.openCompareModal();
      });
    });
  }
  renderCompareTable(e) {
    const t = this.element.querySelector(".rs-compare-table thead tr"), s = this.element.querySelector(".rs-compare-table tbody");
    if (!t || !s) return;
    t.innerHTML = `<th>${this.label("feature") || "Feature"}</th>`, s.innerHTML = "", e.forEach((r) => {
      const a = document.createElement("th");
      a.textContent = r.title || "Property", t.appendChild(a);
    }), [
      { label: this.label("price") || "Price", getValue: (r) => this.formatPrice(r) },
      { label: this.label("location") || "Location", getValue: (r) => r.location || "N/A" },
      { label: this.label("type") || "Type", getValue: (r) => r.type || "N/A" },
      { label: this.label("bedrooms") || "Bedrooms", getValue: (r) => String(r.beds || 0) },
      { label: this.label("bathrooms") || "Bathrooms", getValue: (r) => String(r.baths || 0) },
      { label: this.label("build_size") || "Build Size", getValue: (r) => `${r.built || 0}m²` },
      { label: this.label("plot_size") || "Plot Size", getValue: (r) => `${r.plot || 0}m²` },
      { label: this.label("status") || "Status", getValue: (r) => r.listing_type || "N/A" },
      { label: "Ref", getValue: (r) => r.ref_no || "N/A" }
    ].forEach((r) => {
      const a = document.createElement("tr"), l = document.createElement("td");
      l.textContent = r.label, a.appendChild(l);
      const d = e.map((p) => r.getValue(p)), y = d.every((p) => p === d[0]);
      e.forEach((p, S) => {
        const C = document.createElement("td");
        C.textContent = String(d[S]), y || C.classList.add("rs-compare-highlight"), a.appendChild(C);
      }), s.appendChild(a);
    });
  }
  clearCompare() {
    confirm(this.label("compare_confirm_clear") || "Clear all selected properties?") && (I.clearCompare(), this.closeModalById("rs-compare-modal"));
  }
  formatPrice(e) {
    const t = e, s = Number(t.list_price || t.price || 0), i = Number(t.list_price_2 || 0);
    return i && s !== i ? `€${s.toLocaleString()} - €${i.toLocaleString()}` : `€${s.toLocaleString()}`;
  }
  // PDF functionality
  async downloadPDF() {
    const e = I.getAsArray();
    if (e.length === 0) {
      typeof RealtySoftToast < "u" && RealtySoftToast && RealtySoftToast.error(this.label("wishlist_no_share") || "No properties to export");
      return;
    }
    const t = window;
    if (!t.jspdf) {
      typeof RealtySoftToast < "u" && RealtySoftToast && RealtySoftToast.info("Loading PDF generator...");
      try {
        await this.loadJsPDF();
      } catch (s) {
        console.error("[Wishlist] Failed to load jsPDF:", s), typeof RealtySoftToast < "u" && RealtySoftToast && RealtySoftToast.error("Failed to load PDF library");
        return;
      }
    }
    typeof RealtySoftToast < "u" && RealtySoftToast && RealtySoftToast.info(this.label("results_loading") || "Generating PDF...");
    try {
      const { jsPDF: s } = t.jspdf, i = new s({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      }), r = i.internal.pageSize.getWidth(), a = i.internal.pageSize.getHeight(), l = 15, d = r - l * 2, y = [0, 102, 204], p = [33, 37, 41], S = [248, 249, 250], C = [5, 150, 105];
      let k = 40;
      i.setFontSize(28), i.setTextColor(...y), i.setFont(void 0, "bold"), i.text("Property Wishlist", r / 2, k, { align: "center" }), k += 15, i.setFontSize(14), i.setTextColor(...p), i.setFont(void 0, "normal");
      const L = `${e.length} ${e.length === 1 ? "Property" : "Properties"} Saved`;
      i.text(L, r / 2, k, { align: "center" }), k += 8, i.setFontSize(11), i.setTextColor(128, 128, 128);
      const f = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
      i.text(f, r / 2, k, { align: "center" }), i.setFontSize(9), i.setTextColor(150, 150, 150), i.text("Generated by RealtySoft", r / 2, a - 15, { align: "center" });
      for (let b = 0; b < e.length; b++) {
        const M = e[b];
        i.addPage(), k = l, i.setFontSize(9), i.setTextColor(150, 150, 150), i.setFont(void 0, "normal"), i.text(`Property ${b + 1} of ${e.length}`, l, k), k += 8;
        const z = M.image;
        if (z && typeof z == "string" && z.startsWith("http"))
          try {
            const X = await this.loadImageForPDF(z);
            if (X) {
              const ce = d, c = 110, x = document.createElement("canvas"), $ = x.getContext("2d"), F = X.width / X.height, j = ce / c;
              let Y = 0, Z = 0, Q = X.width, w = X.height;
              F > j ? (Q = X.height * j, Y = (X.width - Q) / 2) : (w = X.width / j, Z = (X.height - w) / 2), x.width = 800, x.height = 800 / ce * c, $.drawImage(X, Y, Z, Q, w, 0, 0, x.width, x.height), i.addImage(x.toDataURL("image/jpeg", 0.85), "JPEG", l, k, ce, c), k += c + 8;
            }
          } catch (X) {
            console.log("[PDF] Could not load image:", X.message);
          }
        i.setFontSize(18), i.setTextColor(...p), i.setFont(void 0, "bold");
        const W = i.splitTextToSize(M.title || "Property", d);
        i.text(W, l, k), k += W.length * 7 + 3, i.setFontSize(10), i.setTextColor(128, 128, 128), i.setFont(void 0, "normal"), i.text(`Ref: ${M.ref_no || ""}`, l, k), k += 12, i.setFontSize(16), i.setTextColor(...C), i.setFont(void 0, "bold"), i.text(this.formatPrice(M), l, k), k += 12, i.setFillColor(...S), i.rect(l, k, d, 42, "F"), k += 8, i.setFontSize(10), i.setTextColor(...p), i.setFont(void 0, "bold"), i.text("Location:", l + 5, k), i.setFont(void 0, "normal"), i.text(M.location || "N/A", l + 28, k), k += 6, i.setFont(void 0, "bold"), i.text("Type:", l + 5, k), i.setFont(void 0, "normal"), i.text(M.type || "N/A", l + 28, k), k += 6;
        const G = M.beds || 0, U = M.baths || 0;
        i.setFont(void 0, "bold"), i.text("Bedrooms:", l + 5, k), i.setFont(void 0, "normal"), i.text(`${G}`, l + 28, k), i.setFont(void 0, "bold"), i.text("Bathrooms:", l + 60, k), i.setFont(void 0, "normal"), i.text(`${U}`, l + 85, k), k += 6;
        const te = `${M.built || 0}m²`, E = `${M.plot || 0}m²`;
        i.setFont(void 0, "bold"), i.text("Build Size:", l + 5, k), i.setFont(void 0, "normal"), i.text(te, l + 28, k), i.setFont(void 0, "bold"), i.text("Plot Size:", l + 60, k), i.setFont(void 0, "normal"), i.text(E, l + 85, k), k += 6, i.setFont(void 0, "bold"), i.text("Status:", l + 5, k), i.setFont(void 0, "normal");
        const N = {
          resale: "listing_type_sale",
          sale: "listing_type_sale",
          development: "listing_type_new",
          new_development: "listing_type_new",
          long_rental: "listing_type_long_rental",
          rent: "listing_type_long_rental",
          short_rental: "listing_type_short_rental",
          holiday: "listing_type_short_rental"
        }, K = (M.listing_type || "").toLowerCase(), ie = N[K] ? this.label(N[K]) : M.listing_type || this.label("listing_type_sale");
        if (i.text(ie, l + 28, k), k += 15, M.addedAt) {
          i.setFontSize(9), i.setTextColor(128, 128, 128);
          const X = new Date(M.addedAt).toLocaleDateString();
          i.text(`Added to wishlist: ${X}`, l, k), k += 8;
        }
        if (M.note) {
          k += 5, i.setFontSize(10), i.setTextColor(...p), i.setFont(void 0, "bold"), i.text("Your Note:", l, k), k += 6, i.setFont(void 0, "normal"), i.setFontSize(9);
          const X = i.splitTextToSize(M.note, d);
          i.text(X, l, k);
        }
        i.setFontSize(8), i.setTextColor(150, 150, 150), i.text(`Page ${b + 2} of ${e.length + 1}`, r / 2, a - 10, { align: "center" });
      }
      const u = `Wishlist_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.pdf`;
      i.save(u), typeof RealtySoftToast < "u" && RealtySoftToast && RealtySoftToast.success((this.label("wishlist_pdf") || "PDF") + " downloaded!"), e.forEach((b) => {
        RealtySoftAnalytics.track("wishlist", "pdf", { property_id: b.ref_no });
      });
    } catch (s) {
      console.error("[Wishlist] PDF generation error:", s), typeof RealtySoftToast < "u" && RealtySoftToast && RealtySoftToast.error("Failed to generate PDF");
    }
  }
  loadJsPDF() {
    return new Promise((e, t) => {
      if (window.jspdf) {
        e();
        return;
      }
      const i = document.createElement("script");
      i.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js", i.onload = () => e(), i.onerror = () => t(new Error("Failed to load jsPDF")), document.head.appendChild(i);
    });
  }
  loadImageForPDF(e) {
    return new Promise((t, s) => {
      const i = new Image();
      i.crossOrigin = "anonymous";
      const r = setTimeout(() => {
        s(new Error("Image load timeout"));
      }, 5e3);
      i.onload = () => {
        clearTimeout(r), t(i);
      }, i.onerror = () => {
        clearTimeout(r), s(new Error("Image load failed"));
      }, i.src = e;
    });
  }
  escapeHtml(e) {
    if (!e) return "";
    const t = document.createElement("div");
    return t.textContent = e, t.innerHTML;
  }
}
RealtySoft.registerComponent("rs_wishlist_modals", Ue);
class Yt extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "isSharedView", !1);
    o(this, "sharedRefNos", []);
    o(this, "subComponents", []);
    o(this, "loader", null);
    this.init();
  }
  init() {
    this.isSharedView = I.isSharedView(), this.sharedRefNos = this.isSharedView ? I.loadSharedWishlist() || [] : [], this.subComponents = [], this.renderStructure(), this.initSubComponents();
  }
  /**
   * render() is called by the controller on language change.
   * We check if DOM is already built to avoid destroying sub-components.
   */
  render() {
    if (this.element.querySelector(".rs-wishlist-list__loader")) {
      const t = this.element.querySelector(".rs-wishlist-list__loader p");
      t && (t.textContent = this.label("results_loading") || "Loading...");
      return;
    }
    this.renderStructure(), this.initSubComponents();
  }
  /**
   * Initial render that creates the DOM structure (only called once in init)
   */
  renderStructure() {
    this.element.classList.add("rs-wishlist-list"), this.element.innerHTML = `
      <!-- Shared Banner -->
      <div class="rs_wishlist_shared_banner"></div>

      <!-- Header -->
      <div class="rs-wishlist-list__header">
        <div class="rs-wishlist-list__header-left">
          <div class="rs_wishlist_header"></div>
        </div>
      </div>

      <!-- Actions Bar -->
      <div class="rs-wishlist-actions-wrapper">
        <div class="rs_wishlist_actions"></div>
        <div class="rs_wishlist_sort"></div>
      </div>

      <!-- Loading State -->
      <div class="rs-wishlist-list__loader">
        <div class="rs-wishlist-list__spinner"></div>
        <p>${this.label("results_loading") || "Loading..."}</p>
      </div>

      <!-- Empty State -->
      <div class="rs_wishlist_empty"></div>

      <!-- Property Grid -->
      <div class="rs_wishlist_grid"></div>

      <!-- Floating Compare Button -->
      <div class="rs_wishlist_compare_btn"></div>

      <!-- Modals -->
      <div class="rs_wishlist_modals"></div>
    `, this.loader = this.element.querySelector(".rs-wishlist-list__loader"), window.addEventListener(I.EVENTS.CHANGED, () => {
      this.hideLoader();
    }), setTimeout(() => this.hideLoader(), 100);
  }
  initSubComponents() {
    [
      { selector: ".rs_wishlist_shared_banner", Component: Ve },
      { selector: ".rs_wishlist_header", Component: Fe },
      { selector: ".rs_wishlist_actions", Component: je },
      { selector: ".rs_wishlist_sort", Component: Ne },
      { selector: ".rs_wishlist_empty", Component: He },
      { selector: ".rs_wishlist_grid", Component: We },
      { selector: ".rs_wishlist_compare_btn", Component: Oe },
      { selector: ".rs_wishlist_modals", Component: Ue }
    ].forEach(({ selector: t, Component: s }) => {
      const i = this.element.querySelector(t);
      if (i && typeof s < "u")
        try {
          const r = new s(i, this.options);
          this.subComponents.push(r), i._rsComponent = r;
        } catch (r) {
          console.warn(`[Wishlist] Failed to initialize ${t}:`, r);
        }
    });
  }
  hideLoader() {
    this.loader && (this.loader.style.display = "none");
  }
  showLoader() {
    this.loader && (this.loader.style.display = "flex");
  }
  bindEvents() {
  }
  // Public API for backward compatibility
  getProperties() {
    const e = this.element.querySelector(".rs_wishlist_grid"), t = e == null ? void 0 : e._rsComponent;
    return t ? t.getProperties() : [];
  }
  openShareModal() {
    I.openModal("share");
  }
  openEmailModal() {
    I.openModal("email");
  }
  openNoteModal(e) {
    I.openModal("note", { refNo: e });
  }
  openCompareModal() {
    I.openModal("compare");
  }
  downloadPDF() {
    I.openModal("pdf");
  }
  destroy() {
    this.subComponents.forEach((e) => {
      e && typeof e.destroy == "function" && e.destroy();
    }), this.subComponents = [], super.destroy();
  }
}
RealtySoft.registerComponent("rs_wishlist_list", Yt);
const ge = class ge extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "currentLanguage", "en_US");
    o(this, "languages", []);
    o(this, "trigger", null);
    o(this, "dropdown", null);
    o(this, "isOpen", !1);
    this.init();
  }
  init() {
    this.currentLanguage = RealtySoftLabels.getLanguage();
    const e = this.element.dataset.languages;
    if (e) {
      const t = e.split(",").map((s) => s.trim());
      this.languages = ge.KNOWN_LANGUAGES.filter((s) => t.includes(s.code));
    } else {
      const t = RealtySoft.State.get("data.availableLanguages");
      t && t.length > 1 ? this.languages = ge.KNOWN_LANGUAGES.filter((s) => t.includes(s.code)) : this.languages = [...ge.KNOWN_LANGUAGES];
    }
    this.render(), this.bindEvents();
  }
  render() {
    this.element.classList.add("rs-language-selector");
    const e = this.languages.find((t) => t.code === this.currentLanguage) || this.languages[0];
    this.element.innerHTML = `
      <div class="rs-language-selector__wrapper">
        <button type="button" class="rs-language-selector__trigger">
          <span class="rs-language-selector__flag">${e.flag}</span>
          <span class="rs-language-selector__label">${e.label}</span>
          <svg class="rs-language-selector__arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        <div class="rs-language-selector__dropdown" style="display: none;">
          ${this.languages.map((t) => `
            <button type="button"
                    class="rs-language-selector__option ${t.code === this.currentLanguage ? "rs-language-selector__option--active" : ""}"
                    data-code="${t.code}">
              <span class="rs-language-selector__flag">${t.flag}</span>
              <span class="rs-language-selector__label">${t.label}</span>
            </button>
          `).join("")}
        </div>
      </div>
    `, this.trigger = this.element.querySelector(".rs-language-selector__trigger"), this.dropdown = this.element.querySelector(".rs-language-selector__dropdown"), this.isOpen = !1;
  }
  bindEvents() {
    var e;
    (e = this.trigger) == null || e.addEventListener("click", () => this.toggleDropdown()), this.element.querySelectorAll(".rs-language-selector__option").forEach((t) => {
      t.addEventListener("click", () => {
        this.selectLanguage(t.dataset.code || "");
      });
    }), document.addEventListener("click", (t) => {
      this.element.contains(t.target) || this.closeDropdown();
    });
  }
  toggleDropdown() {
    this.isOpen ? this.closeDropdown() : this.openDropdown();
  }
  openDropdown() {
    var e;
    this.isOpen = !0, this.dropdown && (this.dropdown.style.display = "block"), (e = this.trigger) == null || e.classList.add("rs-language-selector__trigger--open");
  }
  closeDropdown() {
    var e;
    this.isOpen = !1, this.dropdown && (this.dropdown.style.display = "none"), (e = this.trigger) == null || e.classList.remove("rs-language-selector__trigger--open");
  }
  async selectLanguage(e) {
    var t, s;
    if (e === this.currentLanguage) {
      this.closeDropdown();
      return;
    }
    this.currentLanguage = e;
    try {
      localStorage.setItem("rs_language", e);
    } catch {
    }
    this.closeDropdown(), (t = this.trigger) == null || t.classList.add("rs-language-selector--loading");
    try {
      await RealtySoft.setLanguage(e), this.render(), this.bindEvents(), console.log("[RealtySoft Language Selector] Language changed to:", e);
    } catch (i) {
      console.error("[RealtySoft Language Selector] Error changing language:", i);
      const r = new URL(window.location.href);
      r.searchParams.set("lang", e), window.location.href = r.toString();
    } finally {
      (s = this.trigger) == null || s.classList.remove("rs-language-selector--loading");
    }
  }
};
// Master list of all known languages with display info
o(ge, "KNOWN_LANGUAGES", [
  { code: "en_US", label: "English", flag: "🇬🇧" },
  { code: "es_ES", label: "Español", flag: "🇪🇸" },
  { code: "de_DE", label: "Deutsch", flag: "🇩🇪" },
  { code: "fr_FR", label: "Français", flag: "🇫🇷" },
  { code: "it_IT", label: "Italiano", flag: "🇮🇹" },
  { code: "pt_PT", label: "Português", flag: "🇵🇹" },
  { code: "nl_NL", label: "Nederlands", flag: "🇳🇱" },
  { code: "pl_PL", label: "Polski", flag: "🇵🇱" },
  { code: "ru_RU", label: "Русский", flag: "🇷🇺" },
  { code: "sv_SE", label: "Svenska", flag: "🇸🇪" },
  { code: "no_NO", label: "Norsk", flag: "🇳🇴" },
  { code: "da_DK", label: "Dansk", flag: "🇩🇰" },
  { code: "fi_FI", label: "Suomi", flag: "🇫🇮" }
]);
let Le = ge;
RealtySoft.registerComponent("rs_language_selector", Le);
class fe extends A {
  constructor(e, t = {}) {
    super(e, t);
    o(this, "platform");
    o(this, "url", "");
    o(this, "title", "");
    o(this, "propertyId", "");
    this.platform = t.platform || "generic", this.init();
  }
  init() {
    this.url = this.element.dataset.url || window.location.href, this.title = this.element.dataset.title || document.title, this.propertyId = this.element.dataset.propertyId || "", this.render(), this.bindEvents();
  }
  render() {
    this.element.classList.add("rs-share-btn", `rs-share-btn--${this.platform}`);
  }
  bindEvents() {
    this.element.addEventListener("click", (e) => {
      e.preventDefault(), this.share();
    });
  }
  share() {
  }
  trackShare() {
    this.propertyId && RealtySoftAnalytics.trackShare(this.platform, parseInt(this.propertyId));
  }
  openWindow(e) {
    window.open(e, "_blank", "width=600,height=400,scrollbars=yes");
  }
}
class Jt extends fe {
  constructor(n, e = {}) {
    super(n, { ...e, platform: "whatsapp" });
  }
  render() {
    super.render(), this.element.innerHTML.trim() || (this.element.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      `);
  }
  share() {
    const n = encodeURIComponent(`${this.title} ${this.url}`);
    this.openWindow(`https://wa.me/?text=${n}`), this.trackShare();
  }
}
class Xt extends fe {
  constructor(n, e = {}) {
    super(n, { ...e, platform: "facebook" });
  }
  render() {
    super.render(), this.element.innerHTML.trim() || (this.element.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      `);
  }
  share() {
    const n = encodeURIComponent(this.url);
    this.openWindow(`https://www.facebook.com/sharer/sharer.php?u=${n}`), this.trackShare();
  }
}
class Qt extends fe {
  constructor(n, e = {}) {
    super(n, { ...e, platform: "twitter" });
  }
  render() {
    super.render(), this.element.innerHTML.trim() || (this.element.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      `);
  }
  share() {
    const n = encodeURIComponent(this.title), e = encodeURIComponent(this.url);
    this.openWindow(`https://twitter.com/intent/tweet?text=${n}&url=${e}`), this.trackShare();
  }
}
class es extends fe {
  constructor(n, e = {}) {
    super(n, { ...e, platform: "linkedin" });
  }
  render() {
    super.render(), this.element.innerHTML.trim() || (this.element.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      `);
  }
  share() {
    const n = encodeURIComponent(this.url);
    this.openWindow(`https://www.linkedin.com/sharing/share-offsite/?url=${n}`), this.trackShare();
  }
}
class ts extends fe {
  constructor(n, e = {}) {
    super(n, { ...e, platform: "email" });
  }
  render() {
    super.render(), this.element.innerHTML.trim() || (this.element.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
      `);
  }
  share() {
    const n = encodeURIComponent(this.title), e = encodeURIComponent(`Check out: ${this.url}`);
    window.location.href = `mailto:?subject=${n}&body=${e}`, this.trackShare();
  }
}
class ss extends fe {
  constructor(n, e = {}) {
    super(n, { ...e, platform: "copy" });
  }
  render() {
    super.render(), this.element.innerHTML.trim() || (this.element.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      `);
  }
  async share() {
    try {
      await navigator.clipboard.writeText(this.url), this.showFeedback("Copied!");
    } catch {
      const e = document.createElement("textarea");
      e.value = this.url, document.body.appendChild(e), e.select(), document.execCommand("copy"), document.body.removeChild(e), this.showFeedback("Copied!");
    }
    this.trackShare();
  }
  showFeedback(n) {
    this.element.classList.add("rs-share-btn--copied");
    const e = this.element.innerHTML;
    this.element.innerHTML = `<span>${n}</span>`, setTimeout(() => {
      this.element.innerHTML = e, this.element.classList.remove("rs-share-btn--copied");
    }, 2e3);
  }
}
RealtySoft.registerComponent("rs_share_whatsapp", Jt);
RealtySoft.registerComponent("rs_share_facebook", Xt);
RealtySoft.registerComponent("rs_share_twitter", Qt);
RealtySoft.registerComponent("rs_share_linkedin", es);
RealtySoft.registerComponent("rs_share_email", ts);
RealtySoft.registerComponent("rs_share_copy", ss);
console.log("[RealtySoft] Widget v3.0.0 loaded (Vite build)");
export {
  Xe as default
};
//# sourceMappingURL=realtysoft.es.js.map
