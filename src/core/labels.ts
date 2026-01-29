/**
 * RealtySoft Widget v3 - Labels/i18n
 * Internationalization using labels from API
 */

import type { RealtySoftLabelsModule, LabelOverrides } from '../types/index';

// Language code mapping type
type LanguageMap = Record<string, string>;

const RealtySoftLabels: RealtySoftLabelsModule = (function () {
  'use strict';

  // Default labels (fallback)
  const defaults: Record<string, string> = {
    // Search
    search_location: 'Location',
    search_location_placeholder: 'Search location...',
    search_sublocation: 'Sub-location',
    search_listing_type: 'Status',
    search_listing_type_all: 'Status',
    search_sale: 'ReSale',
    search_rent: 'For Rent',
    listing_type_sale: 'ReSale',
    listing_type_new: 'New Development',
    listing_type_long_rental: 'Long Term Rental',
    listing_type_short_rental: 'Holiday Rental',
    search_property_type: 'Property Type',
    search_property_type_placeholder: 'Any property type',
    search_bedrooms: 'Bedrooms',
    search_bedrooms_any: 'Min Bed',
    search_bedrooms_select: 'Select Bedrooms',
    search_bedrooms_input: 'e.g., 3',
    search_bathrooms: 'Bathrooms',
    search_bathrooms_any: 'Min Bath',
    search_bathrooms_select: 'Select Bathrooms',
    search_bathrooms_input: 'e.g., 2',
    search_price: 'Price',
    search_price_min: 'Min Price',
    search_price_max: 'Max Price',
    search_price_select_min: 'Select Min Price',
    search_price_select_max: 'Select Max Price',
    search_price_input_min: 'Min (e.g., 200000)',
    search_price_input_max: 'Max (e.g., 500000)',
    search_built_area: 'Built Area',
    search_plot_size: 'Plot Size',
    search_features: 'Features',
    search_features_placeholder: 'Select Features',
    search_features_filter: 'Search features...',
    search_reference: 'Reference',
    search_button: 'Search',
    search_reset: 'Reset Filters',
    search_any: 'Any',
    search_all: 'All',
    search_min: 'Min',
    search_max: 'Max',

    // Results
    results_count: '{count} properties found',
    results_count_one: '1 property found',
    results_count_zero: 'No properties found',
    results_sort: 'Sort by',
    results_view_grid: 'Grid',
    results_view_list: 'List',
    results_loading: 'Loading...',

    // Sort options
    sort_newest: 'Newest Listings',
    sort_oldest: 'Oldest Listings',
    sort_updated: 'Recently Updated',
    sort_oldest_updated: 'Oldest Updated',
    sort_price_asc: 'Price: Low to High',
    sort_price_desc: 'Price: High to Low',
    sort_featured: 'Featured First',
    sort_location: 'By Location',
    sort_own: 'Own Properties First',
    sort_recent: 'Recently Added',
    sort_name: 'Name: A-Z',

    // AI Search
    ai_search_title: 'AI Search',
    ai_search_back: 'Back to filters',
    ai_search_placeholder: 'Describe your dream property...\ne.g., 3 bedroom villa with pool near beach under 500k',
    ai_search_try: 'Try:',
    ai_search_button: 'Search',
    ai_search_empty: 'Please describe what you\'re looking for',
    ai_search_error: 'Could not understand your search. Please try again.',
    ai_search_example_1: 'modern apartment with sea views',
    ai_search_example_2: 'family villa with garden under 400k',
    ai_search_example_3: '2 bedroom rental near beach',

    // Property card
    card_bed: 'bed',
    card_beds: 'beds',
    card_bath: 'bath',
    card_baths: 'baths',
    card_built: 'm\u00B2',
    card_plot: 'm\u00B2',
    card_view: 'View Details',
    card_ref: 'Ref:',

    // Property detail
    detail_description: 'Description',
    detail_features: 'Features',
    detail_location: 'Location',
    detail_sublocation: 'Sublocation',
    detail_contact: 'Contact Agent',
    detail_share: 'Share',
    detail_back: 'Back to Results',
    detail_back_to_search: 'Back to Search',
    detail_related: 'Similar Properties',
    detail_year_built: 'Year Built',
    detail_property_type: 'Property Type',
    detail_status: 'Status',
    detail_reference: 'Reference',
    detail_unique_ref: 'Unique Reference',
    detail_postal_code: 'Postal Code',
    detail_floor: 'Floor',
    detail_orientation: 'Orientation',
    detail_condition: 'Condition',
    detail_furnished: 'Furnished',
    detail_views: 'Views',
    detail_parking: 'Parking',
    detail_built_area: 'Built Area',
    detail_plot_size: 'Plot Size',
    detail_usable_area: 'Usable Area',
    detail_terrace: 'Terrace',
    detail_solarium: 'Solarium',
    detail_garden: 'Garden',
    detail_sizes: 'Property Sizes',
    detail_property_info: 'Property Information',
    detail_taxes_fees: 'Taxes & Fees',
    detail_community_fees: 'Community Fees',
    detail_ibi_tax: 'IBI Tax',
    detail_basura_tax: 'Basura Tax',
    detail_per_month: '/month',
    detail_per_year: '/year',
    detail_energy_certificate: 'Energy Certificate',
    detail_energy_rating: 'Energy Rating',
    detail_co2_rating: 'CO2 Rating',
    detail_additional_resources: 'Additional Resources',
    detail_video_tour: 'Video Tour',
    detail_virtual_tour: 'Virtual Tour',
    detail_download_pdf: 'Download PDF',
    detail_read_more: 'Read More',
    detail_read_less: 'Read Less',
    detail_loading_map: 'Loading map...',
    detail_price: 'Price',
    detail_price_on_request: 'Price on Request',

    // Wishlist
    sort_by: 'Sort By',
    wishlist_add: 'Add to Wishlist',
    wishlist_remove: 'Remove from Wishlist',
    wishlist_title: 'My Wishlist',
    wishlist_shared_title: 'Shared Wishlist',
    wishlist_empty: 'Your wishlist is empty',
    wishlist_empty_desc: 'Start adding properties by clicking the heart icon',
    wishlist_share: 'Share',
    wishlist_email: 'Email',
    wishlist_pdf: 'Download PDF',
    wishlist_clear: 'Clear All',
    wishlist_back: 'Back to Results',
    wishlist_browse: 'Browse Properties',
    wishlist_add_note: 'Add Note',
    wishlist_compare: 'Compare',
    wishlist_confirm_remove: 'Remove this property from your wishlist?',
    wishlist_confirm_clear: 'Are you sure you want to clear your entire wishlist?',
    wishlist_removed: 'Removed from wishlist',
    wishlist_cleared: 'Wishlist cleared',
    wishlist_no_share: 'No properties to share',
    wishlist_loading_shared: 'Loading shared properties...',
    wishlist_shared_empty: 'No properties found in shared wishlist',
    wishlist_shared_desc: 'This is a read-only view of saved properties',
    wishlist_error: 'Error loading wishlist',
    wishlist_no_properties: 'No properties saved',
    wishlist_share_title: 'Share Your Wishlist',
    wishlist_share_desc: 'Share this link with anyone to show them your saved properties:',
    wishlist_email_title: 'Email Your Wishlist',
    wishlist_email_to: 'Send to:',
    wishlist_email_from: 'Your email (optional):',
    wishlist_email_message: 'Personal message (optional):',
    wishlist_email_placeholder: 'Add a personal note...',
    wishlist_email_send: 'Send Email',
    wishlist_email_sent: 'Email sent successfully!',
    wishlist_email_error: 'Failed to send email',
    wishlist_note_title: 'Add Property Note',
    wishlist_note_label: 'Your note:',
    wishlist_note_placeholder: 'Add your thoughts, questions, or reminders...',
    wishlist_compare_title: 'Compare Properties',
    wishlist_compare_clear: 'Clear Selection',

    // Sort options for wishlist
    sort_wishlist_recent: 'Recently Added',
    sort_wishlist_oldest: 'Oldest First',
    sort_wishlist_name: 'Name: A-Z',

    // Common
    view_details: 'View Details',
    no_results: 'No results found',
    compare: 'Compare',
    compare_max: 'Maximum',
    compare_min: 'Select at least 2 properties to compare',
    compare_confirm_clear: 'Clear all selected properties?',
    added: 'Added',
    note: 'Note',
    note_saved: 'Note saved!',
    note_deleted: 'Note deleted',
    confirm_delete_note: 'Delete this note?',
    copy: 'Copy',
    copied: 'Link copied to clipboard!',
    cancel: 'Cancel',
    close: 'Close',
    save: 'Save',
    delete: 'Delete',
    error: 'Error',
    property: 'property',
    properties: 'properties',
    saved: 'saved',
    feature: 'Feature',
    price: 'Price',
    location: 'Location',
    type: 'Type',
    bedrooms: 'Bedrooms',
    bathrooms: 'Bathrooms',
    build_size: 'Build Size',
    plot_size: 'Plot Size',
    status: 'Status',
    featured: 'Featured',
    own: 'Own',

    // Inquiry form
    inquiry_name: 'Your Name',
    inquiry_first_name: 'First Name',
    inquiry_last_name: 'Last Name',
    inquiry_email: 'Your Email',
    inquiry_phone: 'Your Phone',
    inquiry_message: 'Message',
    inquiry_submit: 'Send Inquiry',
    inquiry_sending: 'Sending...',
    inquiry_success: 'Thank you! Your inquiry has been sent.',
    inquiry_error: 'Sorry, there was an error. Please try again.',
    inquiry_privacy: 'I accept the privacy policy',
    inquiry_privacy_accept: 'I accept the',
    inquiry_privacy_policy: 'privacy policy',
    inquiry_country: 'Country',
    inquiry_default_message: 'I am interested in the property "{title}"{ref}. Please contact me with more information.',

    // Pagination
    pagination_prev: 'Previous',
    pagination_next: 'Next',
    pagination_page: 'Page',
    pagination_of: 'of',
    pagination_load_more: 'Load More',

    // General
    general_error: 'An error occurred',
    general_retry: 'Try Again',
    general_close: 'Close',
    general_select: 'Select',
    general_selected: 'Selected',
    general_clear: 'Clear',

    // Map
    detail_view_larger_map: 'View Larger Map',
    detail_get_directions: 'Get Directions',
    map_precision_exact: 'Exact location',
    map_precision_zipcode: 'Postal code area',
    map_precision_area: 'Area',
  };

  // Language-specific defaults for labels not provided by the API
  const languageDefaults: Record<string, Record<string, string>> = {
    es_ES: {
      // Search
      search_location: 'Localidad',
      search_location_placeholder: 'Buscar localidad...',
      search_sublocation: 'Ubicación',
      search_listing_type: 'Estatus',
      search_listing_type_all: 'Estatus',
      search_sale: 'Ventas',
      search_rent: 'Alquileres',
      listing_type_sale: 'Ventas',
      listing_type_new: 'Nuevas Promociones',
      listing_type_long_rental: 'Alquileres',
      listing_type_short_rental: 'Alquileres vacacionales',
      search_property_type: 'Tipo de propiedad',
      search_property_type_placeholder: 'Cualquier tipo',
      search_bedrooms: 'Dormitorios',
      search_bedrooms_any: 'Dorm. mín.',
      search_bedrooms_select: 'Seleccionar dormitorios',
      search_bathrooms: 'Baños',
      search_bathrooms_any: 'Baños mín.',
      search_bathrooms_select: 'Seleccionar baños',
      search_price: 'Precio',
      search_price_min: 'Precio mín.',
      search_price_max: 'Precio máx.',
      search_price_select_min: 'Seleccionar precio mín.',
      search_price_select_max: 'Seleccionar precio máx.',
      search_built_area: 'Superficie construida',
      search_plot_size: 'Parcela',
      search_features: 'Características',
      search_features_placeholder: 'Seleccionar características',
      search_features_filter: 'Buscar características...',
      search_reference: 'Referencia',
      search_button: 'Buscar',
      search_reset: 'Reiniciar',
      search_any: 'Cualquiera',
      search_all: 'Todos',
      search_min: 'Mín.',
      search_max: 'Máx.',

      // Results
      results_count: '{count} propiedades encontradas',
      results_count_one: '1 propiedad encontrada',
      results_count_zero: 'No se encontraron propiedades',
      results_sort: 'Ordenar por',
      results_view_grid: 'Cuadrícula',
      results_view_list: 'Lista',
      results_loading: 'Cargando...',

      // Sort
      sort_newest: 'Más recientes',
      sort_oldest: 'Más antiguas',
      sort_updated: 'Actualización reciente',
      sort_oldest_updated: 'Actualización más antigua',
      sort_price_asc: 'Precio: menor a mayor',
      sort_price_desc: 'Precio: mayor a menor',
      sort_featured: 'Destacados primero',
      sort_location: 'Por ubicación',
      sort_own: 'Propiedades propias primero',
      sort_by: 'Ordenar por',
      sort_recent: 'Añadidos recientemente',
      sort_name: 'Nombre: A-Z',

      // AI Search
      ai_search_title: 'Búsqueda IA',
      ai_search_back: 'Volver a filtros',
      ai_search_placeholder: 'Describe tu propiedad ideal...\nej., villa de 3 dormitorios con piscina cerca de la playa menos de 500k',
      ai_search_try: 'Prueba:',
      ai_search_button: 'Buscar',
      ai_search_empty: 'Por favor describe lo que buscas',
      ai_search_error: 'No pudimos entender tu búsqueda. Inténtalo de nuevo.',
      ai_search_example_1: 'apartamento moderno con vistas al mar',
      ai_search_example_2: 'villa familiar con jardín menos de 400k',
      ai_search_example_3: 'alquiler de 2 dormitorios cerca de la playa',

      // Card
      card_bed: 'dorm.',
      card_beds: 'dorm.',
      card_bath: 'baño',
      card_baths: 'baños',
      card_view: 'Ver detalles',
      card_ref: 'Ref:',

      // Detail
      detail_description: 'Descripción',
      detail_features: 'Características',
      detail_location: 'Ubicación',
      detail_contact: 'Contactar agente',
      detail_share: 'Compartir',
      detail_back: 'Volver a resultados',
      detail_back_to_search: 'Volver a búsqueda',
      detail_related: 'Propiedades similares',
      detail_year_built: 'Año de construcción',
      detail_property_type: 'Tipo de propiedad',
      detail_status: 'Estatus',
      detail_reference: 'Referencia',
      detail_unique_ref: 'Referencia única',
      detail_floor: 'Planta',
      detail_orientation: 'Orientación',
      detail_condition: 'Condición',
      detail_furnished: 'Amueblado',
      detail_views: 'Vistas',
      detail_parking: 'Aparcamiento',
      detail_built_area: 'Superficie construida',
      detail_plot_size: 'Parcela',
      detail_usable_area: 'Superficie útil',
      detail_terrace: 'Terraza',
      detail_sizes: 'Medidas de la propiedad',
      detail_property_info: 'Información de la propiedad',
      detail_taxes_fees: 'Impuestos y tasas',
      detail_community_fees: 'Cuota de comunidad',
      detail_ibi_tax: 'IBI',
      detail_basura_tax: 'Basura',
      detail_per_month: '/mes',
      detail_per_year: '/año',
      detail_energy_certificate: 'Certificado energético',
      detail_energy_rating: 'Calificación energética',
      detail_co2_rating: 'Calificación CO2',
      detail_video_tour: 'Vídeo tour',
      detail_virtual_tour: 'Tour virtual',
      detail_download_pdf: 'Descargar PDF',
      detail_loading_map: 'Cargando mapa...',
      detail_read_more: 'Leer más',
      detail_read_less: 'Leer menos',
      detail_price_on_request: 'Precio bajo demanda',
      detail_view_larger_map: 'Ver mapa más grande',
      detail_get_directions: 'Cómo llegar',

      // Wishlist
      wishlist_add: 'Añadir a favoritos',
      wishlist_remove: 'Eliminar de favoritos',
      wishlist_title: 'Mi lista de deseos',
      wishlist_empty: 'Tu lista de deseos está vacía',
      wishlist_empty_desc: 'Añade propiedades haciendo clic en el icono de corazón',
      wishlist_share: 'Compartir',
      wishlist_email: 'Email',
      wishlist_pdf: 'Descargar PDF',
      wishlist_clear: 'Borrar todo',
      wishlist_back: 'Volver a resultados',
      wishlist_browse: 'Ver propiedades',
      wishlist_compare: 'Comparar',
      wishlist_confirm_clear: '¿Estás seguro de que quieres borrar toda tu lista de deseos?',
      wishlist_removed: 'Eliminado de favoritos',
      wishlist_cleared: 'Lista de deseos borrada',
      wishlist_share_title: 'Compartir tu lista',
      wishlist_share_desc: 'Comparte este enlace con cualquiera para mostrarle tus propiedades guardadas:',
      wishlist_email_title: 'Enviar lista por email',
      wishlist_email_to: 'Enviar a:',
      wishlist_email_from: 'Tu email (opcional):',
      wishlist_email_message: 'Mensaje personal (opcional):',
      wishlist_email_placeholder: 'Añade una nota personal...',
      wishlist_email_send: 'Enviar email',
      wishlist_email_sent: '¡Email enviado con éxito!',
      wishlist_email_error: 'Error al enviar el email',
      wishlist_note_title: 'Añadir nota a propiedad',
      wishlist_note_label: 'Tu nota:',
      wishlist_note_placeholder: 'Añade tus pensamientos, preguntas o recordatorios...',
      wishlist_compare_title: 'Comparar propiedades',
      wishlist_compare_clear: 'Limpiar selección',
      note_saved: '¡Nota guardada!',
      note_deleted: 'Nota eliminada',
      confirm_delete_note: '¿Eliminar esta nota?',
      compare_min: 'Selecciona al menos 2 propiedades para comparar',
      compare_confirm_clear: '¿Limpiar todas las propiedades seleccionadas?',
      copied: '¡Enlace copiado al portapapeles!',

      // Inquiry
      inquiry_name: 'Su nombre',
      inquiry_first_name: 'Nombre',
      inquiry_last_name: 'Apellidos',
      inquiry_email: 'Su email',
      inquiry_phone: 'Su teléfono',
      inquiry_message: 'Mensaje',
      inquiry_submit: 'Enviar consulta',
      inquiry_sending: 'Enviando...',
      inquiry_success: '¡Gracias! Su consulta ha sido enviada.',
      inquiry_error: 'Lo sentimos, ha ocurrido un error. Inténtelo de nuevo.',
      inquiry_privacy_accept: 'Acepto la',
      inquiry_privacy_policy: 'política de privacidad',
      inquiry_country: 'País',
      inquiry_default_message: 'Estoy interesado/a en la propiedad "{title}"{ref}. Por favor, contacten conmigo para más información.',

      // Pagination
      pagination_prev: 'Anterior',
      pagination_next: 'Siguiente',
      pagination_page: 'Página',
      pagination_of: 'de',
      pagination_load_more: 'Cargar más',

      // General
      general_error: 'Ha ocurrido un error',
      general_retry: 'Reintentar',
      general_close: 'Cerrar',
      general_select: 'Seleccionar',
      general_selected: 'Seleccionado',
      general_clear: 'Limpiar',
      view_details: 'Ver detalles',
      no_results: 'No se encontraron resultados',
      compare: 'Comparar',
      cancel: 'Cancelar',
      close: 'Cerrar',
      save: 'Guardar',
      delete: 'Eliminar',
      error: 'Error',
      property: 'propiedad',
      properties: 'propiedades',
      featured: 'Destacado',
      own: 'Exclusiva',
      price: 'Precio',
      location: 'Ubicación',
      type: 'Tipo',
      bedrooms: 'Dormitorios',
      bathrooms: 'Baños',
      build_size: 'Construido',
      plot_size: 'Parcela',
      status: 'Estatus',

      // Map
      map_precision_exact: 'Ubicación exacta',
      map_precision_zipcode: 'Código postal',
      map_precision_area: 'Zona',
    },
    de_DE: {
      search_location: 'Standort',
      search_location_placeholder: 'Standort suchen...',
      search_property_type: 'Immobilientyp',
      search_bedrooms: 'Schlafzimmer',
      search_bedrooms_any: 'Min. Schlafz.',
      search_bathrooms: 'Badezimmer',
      search_bathrooms_any: 'Min. Bäder',
      search_price: 'Preis',
      search_price_min: 'Min. Preis',
      search_price_max: 'Max. Preis',
      search_button: 'Suchen',
      search_reset: 'Zurücksetzen',
      search_features: 'Merkmale',
      search_features_placeholder: 'Merkmale auswählen',
      results_count: '{count} Immobilien gefunden',
      results_count_one: '1 Immobilie gefunden',
      results_count_zero: 'Keine Immobilien gefunden',
      results_sort: 'Sortieren nach',
      results_loading: 'Laden...',
      // Sort
      sort_newest: 'Neueste',
      sort_oldest: 'Älteste',
      sort_updated: 'Kürzlich aktualisiert',
      sort_oldest_updated: 'Älteste aktualisiert',
      sort_price_asc: 'Preis: aufsteigend',
      sort_price_desc: 'Preis: absteigend',
      sort_featured: 'Empfohlen zuerst',
      sort_location: 'Nach Standort',
      sort_own: 'Eigene Immobilien zuerst',
      sort_by: 'Sortieren nach',
      sort_recent: 'Kürzlich hinzugefügt',
      sort_name: 'Name: A-Z',

      // AI Search
      ai_search_title: 'KI-Suche',
      ai_search_back: 'Zurück zu Filtern',
      ai_search_placeholder: 'Beschreiben Sie Ihre Traumimmobilie...\nz.B., 3-Zimmer-Villa mit Pool in Strandnähe unter 500k',
      ai_search_try: 'Versuchen Sie:',
      ai_search_button: 'Suchen',
      ai_search_empty: 'Bitte beschreiben Sie, wonach Sie suchen',
      ai_search_error: 'Ihre Suche konnte nicht verstanden werden. Bitte versuchen Sie es erneut.',
      ai_search_example_1: 'moderne Wohnung mit Meerblick',
      ai_search_example_2: 'Familienvilla mit Garten unter 400k',
      ai_search_example_3: '2-Zimmer-Mietwohnung in Strandnähe',

      view_details: 'Details anzeigen',
      card_view: 'Details anzeigen',
      detail_description: 'Beschreibung',
      detail_features: 'Merkmale',
      detail_contact: 'Agent kontaktieren',
      detail_location: 'Standort',
      detail_related: 'Ähnliche Immobilien',
      detail_read_more: 'Mehr lesen',
      detail_read_less: 'Weniger lesen',
      detail_loading_map: 'Karte wird geladen...',
      detail_view_larger_map: 'Größere Karte anzeigen',
      detail_get_directions: 'Wegbeschreibung',
      wishlist_add: 'Zur Merkliste hinzufügen',
      wishlist_remove: 'Von Merkliste entfernen',
      wishlist_title: 'Meine Merkliste',
      wishlist_empty: 'Ihre Merkliste ist leer',
      wishlist_share: 'Teilen',
      wishlist_email: 'E-Mail',
      wishlist_pdf: 'PDF herunterladen',
      wishlist_clear: 'Alles löschen',
      wishlist_compare: 'Vergleichen',
      wishlist_share_title: 'Merkliste teilen',
      wishlist_share_desc: 'Teilen Sie diesen Link, um Ihre gespeicherten Immobilien zu zeigen:',
      wishlist_email_title: 'Merkliste per E-Mail senden',
      wishlist_email_to: 'Senden an:',
      wishlist_email_from: 'Ihre E-Mail (optional):',
      wishlist_email_message: 'Persönliche Nachricht (optional):',
      wishlist_email_placeholder: 'Fügen Sie eine persönliche Notiz hinzu...',
      wishlist_email_send: 'E-Mail senden',
      wishlist_email_sent: 'E-Mail erfolgreich gesendet!',
      wishlist_email_error: 'E-Mail konnte nicht gesendet werden',
      wishlist_note_title: 'Notiz hinzufügen',
      wishlist_note_label: 'Ihre Notiz:',
      wishlist_note_placeholder: 'Fügen Sie Ihre Gedanken, Fragen oder Erinnerungen hinzu...',
      wishlist_compare_title: 'Immobilien vergleichen',
      wishlist_compare_clear: 'Auswahl löschen',
      note_saved: 'Notiz gespeichert!',
      note_deleted: 'Notiz gelöscht',
      confirm_delete_note: 'Diese Notiz löschen?',
      compare_min: 'Wählen Sie mindestens 2 Immobilien zum Vergleichen',
      compare_confirm_clear: 'Alle ausgewählten Immobilien löschen?',
      copied: 'Link in die Zwischenablage kopiert!',
      pagination_prev: 'Zurück',
      pagination_next: 'Weiter',
      general_close: 'Schließen',
      general_clear: 'Löschen',
      cancel: 'Abbrechen',
      close: 'Schließen',
      save: 'Speichern',
      no_results: 'Keine Ergebnisse gefunden',
      inquiry_default_message: 'Ich interessiere mich für die Immobilie "{title}"{ref}. Bitte kontaktieren Sie mich für weitere Informationen.',
    },
    fr_FR: {
      search_location: 'Emplacement',
      search_location_placeholder: 'Rechercher un lieu...',
      search_property_type: 'Type de propriété',
      search_bedrooms: 'Chambres',
      search_bedrooms_any: 'Chambres min.',
      search_bathrooms: 'Salles de bain',
      search_bathrooms_any: 'SdB min.',
      search_price: 'Prix',
      search_price_min: 'Prix min.',
      search_price_max: 'Prix max.',
      search_button: 'Rechercher',
      search_reset: 'Réinitialiser',
      search_features: 'Caractéristiques',
      search_features_placeholder: 'Sélectionner les caractéristiques',
      results_count: '{count} propriétés trouvées',
      results_count_one: '1 propriété trouvée',
      results_count_zero: 'Aucune propriété trouvée',
      results_sort: 'Trier par',
      results_loading: 'Chargement...',
      // Sort
      sort_newest: 'Plus récentes',
      sort_oldest: 'Plus anciennes',
      sort_updated: 'Récemment mis à jour',
      sort_oldest_updated: 'Anciennes mises à jour',
      sort_price_asc: 'Prix: croissant',
      sort_price_desc: 'Prix: décroissant',
      sort_featured: 'En vedette d\'abord',
      sort_location: 'Par emplacement',
      sort_own: 'Nos propriétés d\'abord',
      sort_by: 'Trier par',
      sort_recent: 'Ajoutés récemment',
      sort_name: 'Nom: A-Z',

      // AI Search
      ai_search_title: 'Recherche IA',
      ai_search_back: 'Retour aux filtres',
      ai_search_placeholder: 'Décrivez votre propriété idéale...\nex., villa 3 chambres avec piscine près de la plage moins de 500k',
      ai_search_try: 'Essayez:',
      ai_search_button: 'Rechercher',
      ai_search_empty: 'Veuillez décrire ce que vous recherchez',
      ai_search_error: 'Impossible de comprendre votre recherche. Veuillez réessayer.',
      ai_search_example_1: 'appartement moderne avec vue mer',
      ai_search_example_2: 'villa familiale avec jardin moins de 400k',
      ai_search_example_3: 'location 2 chambres près de la plage',

      view_details: 'Voir les détails',
      card_view: 'Voir les détails',
      detail_description: 'Description',
      detail_features: 'Caractéristiques',
      detail_contact: 'Contacter l\'agent',
      detail_location: 'Emplacement',
      detail_related: 'Propriétés similaires',
      detail_read_more: 'Lire la suite',
      detail_read_less: 'Réduire',
      detail_loading_map: 'Chargement de la carte...',
      detail_view_larger_map: 'Voir carte agrandie',
      detail_get_directions: 'Itinéraire',
      wishlist_add: 'Ajouter aux favoris',
      wishlist_remove: 'Retirer des favoris',
      wishlist_title: 'Ma liste de souhaits',
      wishlist_empty: 'Votre liste de souhaits est vide',
      wishlist_share: 'Partager',
      wishlist_email: 'E-mail',
      wishlist_pdf: 'Télécharger PDF',
      wishlist_clear: 'Tout effacer',
      wishlist_compare: 'Comparer',
      wishlist_share_title: 'Partager votre liste',
      wishlist_share_desc: 'Partagez ce lien pour montrer vos propriétés enregistrées:',
      wishlist_email_title: 'Envoyer la liste par e-mail',
      wishlist_email_to: 'Envoyer à:',
      wishlist_email_from: 'Votre e-mail (optionnel):',
      wishlist_email_message: 'Message personnel (optionnel):',
      wishlist_email_placeholder: 'Ajoutez une note personnelle...',
      wishlist_email_send: 'Envoyer l\'e-mail',
      wishlist_email_sent: 'E-mail envoyé avec succès!',
      wishlist_email_error: 'Impossible d\'envoyer l\'e-mail',
      wishlist_note_title: 'Ajouter une note',
      wishlist_note_label: 'Votre note:',
      wishlist_note_placeholder: 'Ajoutez vos pensées, questions ou rappels...',
      wishlist_compare_title: 'Comparer les propriétés',
      wishlist_compare_clear: 'Effacer la sélection',
      note_saved: 'Note enregistrée!',
      note_deleted: 'Note supprimée',
      confirm_delete_note: 'Supprimer cette note?',
      compare_min: 'Sélectionnez au moins 2 propriétés à comparer',
      compare_confirm_clear: 'Effacer toutes les propriétés sélectionnées?',
      copied: 'Lien copié dans le presse-papiers!',
      pagination_prev: 'Précédent',
      pagination_next: 'Suivant',
      general_close: 'Fermer',
      general_clear: 'Effacer',
      cancel: 'Annuler',
      close: 'Fermer',
      save: 'Enregistrer',
      no_results: 'Aucun résultat trouvé',
      inquiry_default_message: 'Je suis intéressé(e) par la propriété "{title}"{ref}. Veuillez me contacter pour plus d\'informations.',
    },
    nl_NL: {
      // Search
      search_location: 'Locatie',
      search_location_placeholder: 'Zoek locatie...',
      search_sublocation: 'Sublocatie',
      search_listing_type: 'Status',
      search_listing_type_all: 'Status',
      search_sale: 'Verkoop',
      search_rent: 'Huur',
      listing_type_sale: 'Verkoop',
      listing_type_new: 'Nieuwbouw',
      listing_type_long_rental: 'Langetermijnhuur',
      listing_type_short_rental: 'Vakantieverhuur',
      search_property_type: 'Type woning',
      search_property_type_placeholder: 'Elk type',
      search_bedrooms: 'Slaapkamers',
      search_bedrooms_any: 'Min. slaapk.',
      search_bedrooms_select: 'Slaapkamers selecteren',
      search_bathrooms: 'Badkamers',
      search_bathrooms_any: 'Min. badk.',
      search_bathrooms_select: 'Badkamers selecteren',
      search_price: 'Prijs',
      search_price_min: 'Min. prijs',
      search_price_max: 'Max. prijs',
      search_price_select_min: 'Min. prijs selecteren',
      search_price_select_max: 'Max. prijs selecteren',
      search_built_area: 'Bebouwde oppervlakte',
      search_plot_size: 'Perceelgrootte',
      search_features: 'Kenmerken',
      search_features_placeholder: 'Kenmerken selecteren',
      search_features_filter: 'Kenmerken zoeken...',
      search_reference: 'Referentie',
      search_button: 'Zoeken',
      search_reset: 'Opnieuw instellen',
      search_any: 'Alle',
      search_all: 'Alle',
      search_min: 'Min.',
      search_max: 'Max.',

      // Results
      results_count: '{count} woningen gevonden',
      results_count_one: '1 woning gevonden',
      results_count_zero: 'Geen woningen gevonden',
      results_sort: 'Sorteren op',
      results_view_grid: 'Raster',
      results_view_list: 'Lijst',
      results_loading: 'Laden...',

      // Sort
      sort_newest: 'Nieuwste',
      sort_oldest: 'Oudste',
      sort_updated: 'Recent bijgewerkt',
      sort_oldest_updated: 'Oudste bijgewerkt',
      sort_price_asc: 'Prijs: laag naar hoog',
      sort_price_desc: 'Prijs: hoog naar laag',
      sort_featured: 'Uitgelicht eerst',
      sort_location: 'Op locatie',
      sort_own: 'Eigen woningen eerst',
      sort_by: 'Sorteren op',
      sort_recent: 'Recent toegevoegd',
      sort_name: 'Naam: A-Z',

      // AI Search
      ai_search_title: 'AI Zoeken',
      ai_search_back: 'Terug naar filters',
      ai_search_placeholder: 'Beschrijf je droomwoning...\nbijv., villa met 3 slaapkamers en zwembad nabij strand onder 500k',
      ai_search_try: 'Probeer:',
      ai_search_button: 'Zoeken',
      ai_search_empty: 'Beschrijf wat je zoekt',
      ai_search_error: 'Kon je zoekopdracht niet begrijpen. Probeer het opnieuw.',
      ai_search_example_1: 'modern appartement met zeezicht',
      ai_search_example_2: 'familievilla met tuin onder 400k',
      ai_search_example_3: '2 slaapkamer huurwoning nabij strand',

      // Card
      card_bed: 'slaapk.',
      card_beds: 'slaapk.',
      card_bath: 'badk.',
      card_baths: 'badk.',
      card_view: 'Details bekijken',
      card_ref: 'Ref:',

      // Detail
      detail_description: 'Beschrijving',
      detail_features: 'Kenmerken',
      detail_location: 'Locatie',
      detail_contact: 'Contact makelaar',
      detail_share: 'Delen',
      detail_back: 'Terug naar resultaten',
      detail_back_to_search: 'Terug naar zoeken',
      detail_related: 'Vergelijkbare woningen',
      detail_year_built: 'Bouwjaar',
      detail_property_type: 'Type woning',
      detail_status: 'Status',
      detail_reference: 'Referentie',
      detail_unique_ref: 'Unieke referentie',
      detail_floor: 'Verdieping',
      detail_orientation: 'Oriëntatie',
      detail_condition: 'Staat',
      detail_furnished: 'Gemeubileerd',
      detail_views: 'Uitzicht',
      detail_parking: 'Parkeren',
      detail_built_area: 'Bebouwde oppervlakte',
      detail_plot_size: 'Perceelgrootte',
      detail_usable_area: 'Bruikbare oppervlakte',
      detail_terrace: 'Terras',
      detail_sizes: 'Afmetingen',
      detail_property_info: 'Woninginformatie',
      detail_taxes_fees: 'Belastingen & kosten',
      detail_community_fees: 'Servicekosten',
      detail_ibi_tax: 'IBI belasting',
      detail_basura_tax: 'Afvalbelasting',
      detail_per_month: '/maand',
      detail_per_year: '/jaar',
      detail_energy_certificate: 'Energiecertificaat',
      detail_energy_rating: 'Energielabel',
      detail_co2_rating: 'CO2 classificatie',
      detail_video_tour: 'Video tour',
      detail_virtual_tour: 'Virtuele tour',
      detail_download_pdf: 'PDF downloaden',
      detail_loading_map: 'Kaart laden...',
      detail_read_more: 'Lees meer',
      detail_read_less: 'Lees minder',
      detail_price_on_request: 'Prijs op aanvraag',
      detail_view_larger_map: 'Grotere kaart bekijken',
      detail_get_directions: 'Routebeschrijving',

      // Wishlist
      wishlist_add: 'Toevoegen aan favorieten',
      wishlist_remove: 'Verwijderen uit favorieten',
      wishlist_title: 'Mijn verlanglijst',
      wishlist_empty: 'Je verlanglijst is leeg',
      wishlist_empty_desc: 'Voeg woningen toe door op het hartje te klikken',
      wishlist_share: 'Delen',
      wishlist_email: 'E-mail',
      wishlist_pdf: 'PDF downloaden',
      wishlist_clear: 'Alles wissen',
      wishlist_back: 'Terug naar resultaten',
      wishlist_browse: 'Woningen bekijken',
      wishlist_compare: 'Vergelijken',
      wishlist_confirm_clear: 'Weet je zeker dat je je hele verlanglijst wilt wissen?',
      wishlist_removed: 'Verwijderd uit favorieten',
      wishlist_cleared: 'Verlanglijst gewist',
      wishlist_share_title: 'Deel je verlanglijst',
      wishlist_share_desc: 'Deel deze link met iedereen om je opgeslagen woningen te tonen:',
      wishlist_email_title: 'E-mail je verlanglijst',
      wishlist_email_to: 'Verzenden naar:',
      wishlist_email_from: 'Je e-mail (optioneel):',
      wishlist_email_message: 'Persoonlijk bericht (optioneel):',
      wishlist_email_placeholder: 'Voeg een persoonlijke notitie toe...',
      wishlist_email_send: 'E-mail verzenden',
      wishlist_email_sent: 'E-mail succesvol verzonden!',
      wishlist_email_error: 'Kan e-mail niet verzenden',
      wishlist_note_title: 'Notitie toevoegen',
      wishlist_note_label: 'Je notitie:',
      wishlist_note_placeholder: 'Voeg je gedachten, vragen of herinneringen toe...',
      wishlist_compare_title: 'Woningen vergelijken',
      wishlist_compare_clear: 'Selectie wissen',
      note_saved: 'Notitie opgeslagen!',
      note_deleted: 'Notitie verwijderd',
      confirm_delete_note: 'Deze notitie verwijderen?',
      compare_min: 'Selecteer minimaal 2 woningen om te vergelijken',
      compare_confirm_clear: 'Alle geselecteerde woningen wissen?',
      copied: 'Link gekopieerd naar klembord!',

      // Inquiry
      inquiry_name: 'Uw naam',
      inquiry_first_name: 'Voornaam',
      inquiry_last_name: 'Achternaam',
      inquiry_email: 'Uw e-mail',
      inquiry_phone: 'Uw telefoon',
      inquiry_message: 'Bericht',
      inquiry_submit: 'Aanvraag versturen',
      inquiry_sending: 'Verzenden...',
      inquiry_success: 'Bedankt! Uw aanvraag is verstuurd.',
      inquiry_error: 'Er is een fout opgetreden. Probeer het opnieuw.',
      inquiry_privacy_accept: 'Ik accepteer het',
      inquiry_privacy_policy: 'privacybeleid',
      inquiry_country: 'Land',
      inquiry_default_message: 'Ik ben geïnteresseerd in de woning "{title}"{ref}. Neem alstublieft contact met mij op voor meer informatie.',

      // Pagination
      pagination_prev: 'Vorige',
      pagination_next: 'Volgende',
      pagination_page: 'Pagina',
      pagination_of: 'van',
      pagination_load_more: 'Meer laden',

      // General
      general_error: 'Er is een fout opgetreden',
      general_retry: 'Opnieuw proberen',
      general_close: 'Sluiten',
      general_select: 'Selecteren',
      general_selected: 'Geselecteerd',
      general_clear: 'Wissen',
      view_details: 'Details bekijken',
      no_results: 'Geen resultaten gevonden',
      compare: 'Vergelijken',
      cancel: 'Annuleren',
      close: 'Sluiten',
      save: 'Opslaan',
      delete: 'Verwijderen',
      error: 'Fout',
      property: 'woning',
      properties: 'woningen',
      featured: 'Uitgelicht',
      own: 'Eigen',
      price: 'Prijs',
      location: 'Locatie',
      type: 'Type',
      bedrooms: 'Slaapkamers',
      bathrooms: 'Badkamers',
      build_size: 'Bebouwd',
      plot_size: 'Perceel',
      status: 'Status',

      // Map
      map_precision_exact: 'Exacte locatie',
      map_precision_zipcode: 'Postcodegebied',
      map_precision_area: 'Gebied',
    },
    pl_PL: {
      // Search
      search_location: 'Lokalizacja',
      search_location_placeholder: 'Szukaj lokalizacji...',
      search_sublocation: 'Podlokalizacja',
      search_listing_type: 'Status',
      search_listing_type_all: 'Status',
      search_sale: 'Sprzeda\u017c',
      search_rent: 'Wynajem',
      listing_type_sale: 'Sprzeda\u017c',
      listing_type_new: 'Nowe inwestycje',
      listing_type_long_rental: 'Wynajem d\u0142ugoterminowy',
      listing_type_short_rental: 'Wynajem wakacyjny',
      search_property_type: 'Typ nieruchomo\u015bci',
      search_property_type_placeholder: 'Dowolny typ',
      search_bedrooms: 'Sypialnie',
      search_bedrooms_any: 'Min. syp.',
      search_bedrooms_select: 'Wybierz sypialnie',
      search_bathrooms: '\u0141azienki',
      search_bathrooms_any: 'Min. \u0142az.',
      search_bathrooms_select: 'Wybierz \u0142azienki',
      search_price: 'Cena',
      search_price_min: 'Cena min.',
      search_price_max: 'Cena maks.',
      search_price_select_min: 'Wybierz cen\u0119 min.',
      search_price_select_max: 'Wybierz cen\u0119 maks.',
      search_built_area: 'Powierzchnia zabudowy',
      search_plot_size: 'Powierzchnia dzia\u0142ki',
      search_features: 'Cechy',
      search_features_placeholder: 'Wybierz cechy',
      search_features_filter: 'Szukaj cech...',
      search_reference: 'Referencja',
      search_button: 'Szukaj',
      search_reset: 'Resetuj',
      search_any: 'Dowolny',
      search_all: 'Wszystkie',
      search_min: 'Min.',
      search_max: 'Maks.',

      // Results
      results_count: 'Znaleziono {count} nieruchomo\u015bci',
      results_count_one: 'Znaleziono 1 nieruchomo\u015b\u0107',
      results_count_zero: 'Nie znaleziono nieruchomo\u015bci',
      results_sort: 'Sortuj wed\u0142ug',
      results_view_grid: 'Siatka',
      results_view_list: 'Lista',
      results_loading: '\u0141adowanie...',

      // Sort
      sort_newest: 'Najnowsze',
      sort_oldest: 'Najstarsze',
      sort_updated: 'Ostatnio zaktualizowane',
      sort_oldest_updated: 'Najdawniej zaktualizowane',
      sort_price_asc: 'Cena: rosn\u0105co',
      sort_price_desc: 'Cena: malej\u0105co',
      sort_featured: 'Wyr\u00f3\u017cnione',
      sort_location: 'Wg lokalizacji',
      sort_own: 'W\u0142asne nieruchomo\u015bci najpierw',
      sort_by: 'Sortuj wed\u0142ug',
      sort_recent: 'Ostatnio dodane',
      sort_name: 'Nazwa: A-Z',

      // AI Search
      ai_search_title: 'Wyszukiwanie AI',
      ai_search_back: 'Powr\u00f3t do filtr\u00f3w',
      ai_search_placeholder: 'Opisz swoj\u0105 wymarzon\u0105 nieruchomo\u015b\u0107...\nnp., willa z 3 sypialniami z basenem blisko pla\u017cy poni\u017cej 500k',
      ai_search_try: 'Spr\u00f3buj:',
      ai_search_button: 'Szukaj',
      ai_search_empty: 'Opisz czego szukasz',
      ai_search_error: 'Nie uda\u0142o si\u0119 zrozumie\u0107 wyszukiwania. Spr\u00f3buj ponownie.',
      ai_search_example_1: 'nowoczesne mieszkanie z widokiem na morze',
      ai_search_example_2: 'rodzinna willa z ogrodem poni\u017cej 400k',
      ai_search_example_3: '2 sypialnie do wynaj\u0119cia blisko pla\u017cy',

      // Card
      card_bed: 'syp.',
      card_beds: 'syp.',
      card_bath: '\u0142az.',
      card_baths: '\u0142az.',
      card_view: 'Szczeg\u00f3\u0142y',
      card_ref: 'Ref:',

      // Detail
      detail_description: 'Opis',
      detail_features: 'Cechy',
      detail_location: 'Lokalizacja',
      detail_contact: 'Kontakt z agentem',
      detail_share: 'Udost\u0119pnij',
      detail_back: 'Powr\u00f3t do wynik\u00f3w',
      detail_back_to_search: 'Powr\u00f3t do wyszukiwania',
      detail_related: 'Podobne nieruchomo\u015bci',
      detail_year_built: 'Rok budowy',
      detail_property_type: 'Typ nieruchomo\u015bci',
      detail_status: 'Status',
      detail_reference: 'Referencja',
      detail_unique_ref: 'Unikalna referencja',
      detail_floor: 'Pi\u0119tro',
      detail_orientation: 'Orientacja',
      detail_condition: 'Stan',
      detail_furnished: 'Umeblowane',
      detail_views: 'Widoki',
      detail_parking: 'Parking',
      detail_built_area: 'Powierzchnia zabudowy',
      detail_plot_size: 'Powierzchnia dzia\u0142ki',
      detail_usable_area: 'Powierzchnia u\u017cytkowa',
      detail_terrace: 'Taras',
      detail_sizes: 'Wymiary nieruchomo\u015bci',
      detail_property_info: 'Informacje o nieruchomo\u015bci',
      detail_taxes_fees: 'Podatki i op\u0142aty',
      detail_community_fees: 'Op\u0142aty wsp\u00f3lnoty',
      detail_ibi_tax: 'Podatek IBI',
      detail_basura_tax: 'Op\u0142ata za \u015bmieci',
      detail_per_month: '/miesi\u0105c',
      detail_per_year: '/rok',
      detail_energy_certificate: 'Certyfikat energetyczny',
      detail_energy_rating: 'Klasa energetyczna',
      detail_co2_rating: 'Klasa CO2',
      detail_video_tour: 'Wideo',
      detail_virtual_tour: 'Wirtualny spacer',
      detail_download_pdf: 'Pobierz PDF',
      detail_loading_map: '\u0141adowanie mapy...',
      detail_read_more: 'Czytaj więcej',
      detail_read_less: 'Czytaj mniej',
      detail_price_on_request: 'Cena na zapytanie',
      detail_view_larger_map: 'Powi\u0119ksz map\u0119',
      detail_get_directions: 'Wyznacz tras\u0119',

      // Wishlist
      wishlist_add: 'Dodaj do ulubionych',
      wishlist_remove: 'Usu\u0144 z ulubionych',
      wishlist_title: 'Moja lista \u017cycze\u0144',
      wishlist_empty: 'Twoja lista \u017cycze\u0144 jest pusta',
      wishlist_empty_desc: 'Dodaj nieruchomo\u015bci klikaj\u0105c ikon\u0119 serca',
      wishlist_share: 'Udost\u0119pnij',
      wishlist_email: 'E-mail',
      wishlist_pdf: 'Pobierz PDF',
      wishlist_clear: 'Wyczy\u015b\u0107 wszystko',
      wishlist_back: 'Powr\u00f3t do wynik\u00f3w',
      wishlist_browse: 'Przegl\u0105daj nieruchomo\u015bci',
      wishlist_compare: 'Por\u00f3wnaj',
      wishlist_confirm_clear: 'Czy na pewno chcesz wyczy\u015bci\u0107 ca\u0142\u0105 list\u0119 \u017cycze\u0144?',
      wishlist_removed: 'Usuni\u0119to z ulubionych',
      wishlist_cleared: 'Lista \u017cycze\u0144 wyczyszczona',
      wishlist_share_title: 'Udost\u0119pnij swoj\u0105 list\u0119',
      wishlist_share_desc: 'Udost\u0119pnij ten link, aby pokaza\u0107 zapisane nieruchomo\u015bci:',
      wishlist_email_title: 'Wy\u015blij list\u0119 e-mailem',
      wishlist_email_to: 'Wy\u015blij do:',
      wishlist_email_from: 'Tw\u00f3j e-mail (opcjonalnie):',
      wishlist_email_message: 'Wiadomo\u015b\u0107 osobista (opcjonalnie):',
      wishlist_email_placeholder: 'Dodaj osobist\u0105 notatk\u0119...',
      wishlist_email_send: 'Wy\u015blij e-mail',
      wishlist_email_sent: 'E-mail wys\u0142any pomy\u015blnie!',
      wishlist_email_error: 'Nie uda\u0142o si\u0119 wys\u0142a\u0107 e-maila',
      wishlist_note_title: 'Dodaj notatk\u0119',
      wishlist_note_label: 'Twoja notatka:',
      wishlist_note_placeholder: 'Dodaj swoje przemys\u0142enia, pytania lub przypomnienia...',
      wishlist_compare_title: 'Por\u00f3wnaj nieruchomo\u015bci',
      wishlist_compare_clear: 'Wyczy\u015b\u0107 wyb\u00f3r',
      note_saved: 'Notatka zapisana!',
      note_deleted: 'Notatka usuni\u0119ta',
      confirm_delete_note: 'Usun\u0105\u0107 t\u0119 notatk\u0119?',
      compare_min: 'Wybierz co najmniej 2 nieruchomo\u015bci do por\u00f3wnania',
      compare_confirm_clear: 'Wyczy\u015bci\u0107 wszystkie wybrane nieruchomo\u015bci?',
      copied: 'Link skopiowany do schowka!',

      // Inquiry
      inquiry_name: 'Twoje imi\u0119',
      inquiry_first_name: 'Imi\u0119',
      inquiry_last_name: 'Nazwisko',
      inquiry_email: 'Tw\u00f3j e-mail',
      inquiry_phone: 'Tw\u00f3j telefon',
      inquiry_message: 'Wiadomo\u015b\u0107',
      inquiry_submit: 'Wy\u015blij zapytanie',
      inquiry_sending: 'Wysy\u0142anie...',
      inquiry_success: 'Dzi\u0119kujemy! Twoje zapytanie zosta\u0142o wys\u0142ane.',
      inquiry_error: 'Przepraszamy, wyst\u0105pi\u0142 b\u0142\u0105d. Spr\u00f3buj ponownie.',
      inquiry_privacy_accept: 'Akceptuj\u0119',
      inquiry_privacy_policy: 'polityk\u0119 prywatno\u015bci',
      inquiry_country: 'Kraj',
      inquiry_default_message: 'Jestem zainteresowany/a nieruchomo\u015bci\u0105 "{title}"{ref}. Prosz\u0119 o kontakt w celu uzyskania wi\u0119cej informacji.',

      // Pagination
      pagination_prev: 'Poprzednia',
      pagination_next: 'Nast\u0119pna',
      pagination_page: 'Strona',
      pagination_of: 'z',
      pagination_load_more: 'Za\u0142aduj wi\u0119cej',

      // General
      general_error: 'Wyst\u0105pi\u0142 b\u0142\u0105d',
      general_retry: 'Spr\u00f3buj ponownie',
      general_close: 'Zamknij',
      general_select: 'Wybierz',
      general_selected: 'Wybrano',
      general_clear: 'Wyczy\u015b\u0107',
      view_details: 'Szczeg\u00f3\u0142y',
      no_results: 'Nie znaleziono wynik\u00f3w',
      compare: 'Por\u00f3wnaj',
      cancel: 'Anuluj',
      close: 'Zamknij',
      save: 'Zapisz',
      delete: 'Usu\u0144',
      error: 'B\u0142\u0105d',
      property: 'nieruchomo\u015b\u0107',
      properties: 'nieruchomo\u015bci',
      featured: 'Wyr\u00f3\u017cnione',
      own: 'W\u0142asne',
      price: 'Cena',
      location: 'Lokalizacja',
      type: 'Typ',
      bedrooms: 'Sypialnie',
      bathrooms: '\u0141azienki',
      build_size: 'Zabudowa',
      plot_size: 'Dzia\u0142ka',
      status: 'Status',

      // Map
      map_precision_exact: 'Dok\u0142adna lokalizacja',
      map_precision_zipcode: 'Kod pocztowy',
      map_precision_area: 'Obszar',
    },
    it_IT: {
      // AI Search
      ai_search_title: 'Ricerca IA',
      ai_search_back: 'Torna ai filtri',
      ai_search_placeholder: 'Descrivi la tua proprietà ideale...\nes., villa 3 camere con piscina vicino alla spiaggia sotto 500k',
      ai_search_try: 'Prova:',
      ai_search_button: 'Cerca',
      ai_search_empty: 'Descrivi cosa stai cercando',
      ai_search_error: 'Impossibile comprendere la ricerca. Riprova.',
      ai_search_example_1: 'appartamento moderno con vista mare',
      ai_search_example_2: 'villa familiare con giardino sotto 400k',
      ai_search_example_3: 'affitto 2 camere vicino alla spiaggia',
      // Sort
      sort_newest: 'Più recenti',
      sort_oldest: 'Più vecchi',
      sort_updated: 'Aggiornati di recente',
      sort_oldest_updated: 'Aggiornati meno recenti',
      sort_price_asc: 'Prezzo: crescente',
      sort_price_desc: 'Prezzo: decrescente',
      sort_featured: 'In evidenza',
      sort_location: 'Per posizione',
      sort_own: 'Nostre proprietà prima',
      sort_recent: 'Aggiunti di recente',
      sort_name: 'Nome: A-Z',
      results_sort: 'Ordina per',
      search_button: 'Cerca',
      // Detail page
      detail_location: 'Posizione',
      detail_related: 'Proprietà simili',
      detail_read_more: 'Leggi di più',
      detail_read_less: 'Leggi meno',
      detail_loading_map: 'Caricamento mappa...',
      detail_view_larger_map: 'Visualizza mappa più grande',
      detail_get_directions: 'Indicazioni stradali',
      wishlist_add: 'Aggiungi ai preferiti',
      wishlist_remove: 'Rimuovi dai preferiti',
      pagination_prev: 'Precedente',
      pagination_next: 'Successivo',
      inquiry_default_message: 'Sono interessato/a alla proprietà "{title}"{ref}. Vi prego di contattarmi per maggiori informazioni.',
    },
    pt_PT: {
      // AI Search
      ai_search_title: 'Pesquisa IA',
      ai_search_back: 'Voltar aos filtros',
      ai_search_placeholder: 'Descreva o seu imóvel ideal...\nex., moradia T3 com piscina perto da praia menos de 500k',
      ai_search_try: 'Experimente:',
      ai_search_button: 'Pesquisar',
      ai_search_empty: 'Descreva o que procura',
      ai_search_error: 'Não foi possível entender a pesquisa. Tente novamente.',
      ai_search_example_1: 'apartamento moderno com vista mar',
      ai_search_example_2: 'moradia familiar com jardim menos de 400k',
      ai_search_example_3: 'arrendamento T2 perto da praia',
      // Sort
      sort_newest: 'Mais recentes',
      sort_oldest: 'Mais antigos',
      sort_updated: 'Atualizados recentemente',
      sort_price_asc: 'Preço: crescente',
      sort_price_desc: 'Preço: decrescente',
      sort_featured: 'Em destaque',
      sort_location: 'Por localização',
      sort_recent: 'Adicionados recentemente',
      sort_name: 'Nome: A-Z',
      results_sort: 'Ordenar por',
      search_button: 'Pesquisar',
      // Detail page
      detail_location: 'Localização',
      detail_related: 'Imóveis semelhantes',
      detail_read_more: 'Ler mais',
      detail_read_less: 'Ler menos',
      detail_loading_map: 'A carregar mapa...',
      detail_view_larger_map: 'Ver mapa maior',
      detail_get_directions: 'Obter direções',
      wishlist_add: 'Adicionar aos favoritos',
      wishlist_remove: 'Remover dos favoritos',
      pagination_prev: 'Anterior',
      pagination_next: 'Seguinte',
      inquiry_default_message: 'Estou interessado/a no imóvel "{title}"{ref}. Por favor, contactem-me para mais informações.',
    },
    ru_RU: {
      // AI Search
      ai_search_title: 'ИИ Поиск',
      ai_search_back: 'Назад к фильтрам',
      ai_search_placeholder: 'Опишите вашу идеальную недвижимость...\nнапр., вилла с 3 спальнями и бассейном у пляжа до 500k',
      ai_search_try: 'Попробуйте:',
      ai_search_button: 'Искать',
      ai_search_empty: 'Опишите, что вы ищете',
      ai_search_error: 'Не удалось понять запрос. Попробуйте снова.',
      ai_search_example_1: 'современная квартира с видом на море',
      ai_search_example_2: 'семейная вилла с садом до 400k',
      ai_search_example_3: 'аренда 2 спальни у пляжа',
      // Sort
      sort_newest: 'Новейшие',
      sort_oldest: 'Старейшие',
      sort_updated: 'Недавно обновленные',
      sort_price_asc: 'Цена: по возрастанию',
      sort_price_desc: 'Цена: по убыванию',
      sort_featured: 'Рекомендуемые',
      sort_location: 'По расположению',
      sort_recent: 'Недавно добавленные',
      sort_name: 'Название: А-Я',
      results_sort: 'Сортировать',
      search_button: 'Поиск',
      // Detail page
      detail_location: 'Расположение',
      detail_related: 'Похожие объекты',
      detail_read_more: 'Читать далее',
      detail_read_less: 'Свернуть',
      detail_loading_map: 'Загрузка карты...',
      detail_view_larger_map: 'Увеличить карту',
      detail_get_directions: 'Проложить маршрут',
      wishlist_add: 'Добавить в избранное',
      wishlist_remove: 'Удалить из избранного',
      pagination_prev: 'Назад',
      pagination_next: 'Далее',
      inquiry_default_message: 'Меня интересует недвижимость "{title}"{ref}. Пожалуйста, свяжитесь со мной для получения дополнительной информации.',
    },
    zh_CN: {
      // AI Search
      ai_search_title: 'AI搜索',
      ai_search_back: '返回筛选',
      ai_search_placeholder: '描述您理想的房产...\n例如：3卧室海滨别墅带泳池，50万以下',
      ai_search_try: '试试：',
      ai_search_button: '搜索',
      ai_search_empty: '请描述您要找的内容',
      ai_search_error: '无法理解您的搜索，请重试。',
      ai_search_example_1: '现代海景公寓',
      ai_search_example_2: '带花园的家庭别墅40万以下',
      ai_search_example_3: '海滩附近2卧室出租',
      // Sort
      sort_newest: '最新',
      sort_oldest: '最旧',
      sort_updated: '最近更新',
      sort_price_asc: '价格：从低到高',
      sort_price_desc: '价格：从高到低',
      sort_featured: '精选优先',
      sort_location: '按位置',
      sort_recent: '最近添加',
      sort_name: '名称: A-Z',
      results_sort: '排序',
      search_button: '搜索',
      // Detail page
      detail_location: '位置',
      detail_related: '相似房产',
      detail_read_more: '阅读更多',
      detail_read_less: '收起',
      detail_loading_map: '加载地图中...',
      detail_view_larger_map: '查看大地图',
      detail_get_directions: '获取路线',
      wishlist_add: '添加到收藏夹',
      wishlist_remove: '从收藏夹移除',
      pagination_prev: '上一页',
      pagination_next: '下一页',
      inquiry_default_message: '我对房产"{title}"{ref}感兴趣。请与我联系以获取更多信息。',
    },
    ja_JP: {
      // AI Search
      ai_search_title: 'AI検索',
      ai_search_back: 'フィルターに戻る',
      ai_search_placeholder: '理想の物件を説明してください...\n例：ビーチ近く、プール付き3ベッドルームヴィラ、50万以下',
      ai_search_try: '試す：',
      ai_search_button: '検索',
      ai_search_empty: '探しているものを説明してください',
      ai_search_error: '検索を理解できませんでした。もう一度お試しください。',
      ai_search_example_1: '海の見えるモダンアパートメント',
      ai_search_example_2: '庭付きファミリーヴィラ40万以下',
      ai_search_example_3: 'ビーチ近くの2ベッドルーム賃貸',
      // Sort
      sort_newest: '新着順',
      sort_oldest: '古い順',
      sort_updated: '更新順',
      sort_price_asc: '価格：安い順',
      sort_price_desc: '価格：高い順',
      sort_featured: 'おすすめ',
      sort_location: '場所順',
      sort_recent: '最近追加',
      sort_name: '名前: A-Z',
      results_sort: '並び替え',
      search_button: '検索',
      // Detail page
      detail_location: '所在地',
      detail_related: '類似物件',
      detail_read_more: '続きを読む',
      detail_read_less: '閉じる',
      detail_loading_map: '地図を読み込み中...',
      detail_view_larger_map: '大きな地図で見る',
      detail_get_directions: '道順を調べる',
      wishlist_add: 'お気に入りに追加',
      wishlist_remove: 'お気に入りから削除',
      pagination_prev: '前へ',
      pagination_next: '次へ',
      inquiry_default_message: '物件「{title}」{ref}に興味があります。詳細についてご連絡ください。',
    },
    ar_SA: {
      // AI Search
      ai_search_title: 'بحث بالذكاء الاصطناعي',
      ai_search_back: 'العودة للفلاتر',
      ai_search_placeholder: 'صف عقارك المثالي...\nمثال: فيلا 3 غرف نوم مع مسبح قرب الشاطئ أقل من 500 ألف',
      ai_search_try: 'جرب:',
      ai_search_button: 'بحث',
      ai_search_empty: 'صف ما تبحث عنه',
      ai_search_error: 'لم نتمكن من فهم بحثك. حاول مرة أخرى.',
      ai_search_example_1: 'شقة حديثة مع إطلالة بحرية',
      ai_search_example_2: 'فيلا عائلية مع حديقة أقل من 400 ألف',
      ai_search_example_3: 'إيجار غرفتين قرب الشاطئ',
      // Sort
      sort_newest: 'الأحدث',
      sort_oldest: 'الأقدم',
      sort_updated: 'المحدثة مؤخراً',
      sort_price_asc: 'السعر: من الأقل',
      sort_price_desc: 'السعر: من الأعلى',
      sort_featured: 'المميزة أولاً',
      sort_location: 'حسب الموقع',
      sort_recent: 'المضافة حديثاً',
      sort_name: 'الاسم: أ-ي',
      results_sort: 'ترتيب حسب',
      search_button: 'بحث',
      // Detail page
      detail_location: 'الموقع',
      detail_related: 'عقارات مشابهة',
      detail_read_more: 'اقرأ المزيد',
      detail_read_less: 'اقرأ أقل',
      detail_loading_map: 'جاري تحميل الخريطة...',
      detail_view_larger_map: 'عرض خريطة أكبر',
      detail_get_directions: 'الحصول على الاتجاهات',
      wishlist_add: 'إضافة إلى المفضلة',
      wishlist_remove: 'إزالة من المفضلة',
      pagination_prev: 'السابق',
      pagination_next: 'التالي',
      inquiry_default_message: 'أنا مهتم بالعقار "{title}"{ref}. يرجى التواصل معي لمزيد من المعلومات.',
    },
    sv_SE: {
      // AI Search
      ai_search_title: 'AI-sökning',
      ai_search_back: 'Tillbaka till filter',
      ai_search_placeholder: 'Beskriv din drömbostad...\nt.ex., 3 sovrum villa med pool nära stranden under 500k',
      ai_search_try: 'Prova:',
      ai_search_button: 'Sök',
      ai_search_empty: 'Beskriv vad du letar efter',
      ai_search_error: 'Kunde inte förstå din sökning. Försök igen.',
      ai_search_example_1: 'modern lägenhet med havsutsikt',
      ai_search_example_2: 'familjevilla med trädgård under 400k',
      ai_search_example_3: '2 sovrum hyra nära stranden',
      // Sort
      sort_newest: 'Nyaste',
      sort_oldest: 'Äldsta',
      sort_updated: 'Senast uppdaterade',
      sort_price_asc: 'Pris: lägst först',
      sort_price_desc: 'Pris: högst först',
      sort_featured: 'Utvalda först',
      sort_location: 'Efter plats',
      sort_recent: 'Nyligen tillagda',
      sort_name: 'Namn: A-Ö',
      results_sort: 'Sortera efter',
      search_button: 'Sök',
      // Detail page
      detail_location: 'Plats',
      detail_related: 'Liknande fastigheter',
      detail_read_more: 'Läs mer',
      detail_read_less: 'Läs mindre',
      detail_loading_map: 'Laddar karta...',
      detail_view_larger_map: 'Visa större karta',
      detail_get_directions: 'Vägbeskrivning',
      wishlist_add: 'Lägg till i favoriter',
      wishlist_remove: 'Ta bort från favoriter',
      pagination_prev: 'Föregående',
      pagination_next: 'Nästa',
      inquiry_default_message: 'Jag är intresserad av fastigheten "{title}"{ref}. Vänligen kontakta mig för mer information.',
    },
    no_NO: {
      // AI Search
      ai_search_title: 'AI-søk',
      ai_search_back: 'Tilbake til filtre',
      ai_search_placeholder: 'Beskriv din drømmebolig...\nf.eks., 3 soverom villa med basseng nær stranden under 500k',
      ai_search_try: 'Prøv:',
      ai_search_button: 'Søk',
      ai_search_empty: 'Beskriv hva du leter etter',
      ai_search_error: 'Kunne ikke forstå søket ditt. Prøv igjen.',
      ai_search_example_1: 'moderne leilighet med havutsikt',
      ai_search_example_2: 'familievilla med hage under 400k',
      ai_search_example_3: '2 soverom leie nær stranden',
      // Sort
      sort_newest: 'Nyeste',
      sort_oldest: 'Eldste',
      sort_updated: 'Sist oppdatert',
      sort_price_asc: 'Pris: lavest først',
      sort_price_desc: 'Pris: høyest først',
      sort_featured: 'Utvalgte først',
      sort_location: 'Etter sted',
      sort_recent: 'Nylig lagt til',
      sort_name: 'Navn: A-Å',
      results_sort: 'Sorter etter',
      search_button: 'Søk',
      // Detail page
      detail_location: 'Beliggenhet',
      detail_related: 'Lignende eiendommer',
      detail_read_more: 'Les mer',
      detail_read_less: 'Les mindre',
      detail_loading_map: 'Laster kart...',
      detail_view_larger_map: 'Vis større kart',
      detail_get_directions: 'Veibeskrivelse',
      wishlist_add: 'Legg til i favoritter',
      wishlist_remove: 'Fjern fra favoritter',
      pagination_prev: 'Forrige',
      pagination_next: 'Neste',
      inquiry_default_message: 'Jeg er interessert i eiendommen "{title}"{ref}. Vennligst ta kontakt for mer informasjon.',
    },
    da_DK: {
      // AI Search
      ai_search_title: 'AI-søgning',
      ai_search_back: 'Tilbage til filtre',
      ai_search_placeholder: 'Beskriv din drømmebolig...\nf.eks., 3 værelses villa med pool nær stranden under 500k',
      ai_search_try: 'Prøv:',
      ai_search_button: 'Søg',
      ai_search_empty: 'Beskriv hvad du leder efter',
      ai_search_error: 'Kunne ikke forstå din søgning. Prøv igen.',
      ai_search_example_1: 'moderne lejlighed med havudsigt',
      ai_search_example_2: 'familievilla med have under 400k',
      ai_search_example_3: '2 værelses leje nær stranden',
      // Sort
      sort_newest: 'Nyeste',
      sort_oldest: 'Ældste',
      sort_updated: 'Sidst opdateret',
      sort_price_asc: 'Pris: lavest først',
      sort_price_desc: 'Pris: højest først',
      sort_featured: 'Fremhævede først',
      sort_location: 'Efter placering',
      sort_recent: 'Senest tilføjet',
      sort_name: 'Navn: A-Å',
      results_sort: 'Sortér efter',
      search_button: 'Søg',
      // Detail page
      detail_location: 'Beliggenhed',
      detail_related: 'Lignende ejendomme',
      detail_read_more: 'Læs mere',
      detail_read_less: 'Læs mindre',
      detail_loading_map: 'Indlæser kort...',
      detail_view_larger_map: 'Vis større kort',
      detail_get_directions: 'Rutevejledning',
      wishlist_add: 'Tilføj til favoritter',
      wishlist_remove: 'Fjern fra favoritter',
      pagination_prev: 'Forrige',
      pagination_next: 'Næste',
      inquiry_default_message: 'Jeg er interesseret i ejendommen "{title}"{ref}. Kontakt mig venligst for mere information.',
    },
    fi_FI: {
      // AI Search
      ai_search_title: 'Tekoälyhaku',
      ai_search_back: 'Takaisin suodattimiin',
      ai_search_placeholder: 'Kuvaile unelma-asuntoasi...\nesim., 3 makuuhuoneen huvila uima-altaalla rannan lähellä alle 500k',
      ai_search_try: 'Kokeile:',
      ai_search_button: 'Hae',
      ai_search_empty: 'Kuvaile mitä etsit',
      ai_search_error: 'Hakua ei voitu ymmärtää. Yritä uudelleen.',
      ai_search_example_1: 'moderni asunto merinäköalalla',
      ai_search_example_2: 'perhehuvila puutarhalla alle 400k',
      ai_search_example_3: '2 makuuhuoneen vuokra rannan lähellä',
      // Sort
      sort_newest: 'Uusimmat',
      sort_oldest: 'Vanhimmat',
      sort_updated: 'Viimeksi päivitetyt',
      sort_price_asc: 'Hinta: halvin ensin',
      sort_price_desc: 'Hinta: kallein ensin',
      sort_featured: 'Suositellut ensin',
      sort_location: 'Sijainnin mukaan',
      sort_recent: 'Viimeksi lisätyt',
      sort_name: 'Nimi: A-Ö',
      results_sort: 'Järjestä',
      search_button: 'Hae',
      // Detail page
      detail_location: 'Sijainti',
      detail_related: 'Samankaltaiset kohteet',
      detail_read_more: 'Lue lisää',
      detail_read_less: 'Näytä vähemmän',
      detail_loading_map: 'Ladataan karttaa...',
      detail_view_larger_map: 'Näytä suurempi kartta',
      detail_get_directions: 'Reittiohjeet',
      wishlist_add: 'Lisää suosikkeihin',
      wishlist_remove: 'Poista suosikeista',
      pagination_prev: 'Edellinen',
      pagination_next: 'Seuraava',
      inquiry_default_message: 'Olen kiinnostunut kiinteistöstä "{title}"{ref}. Ota minuun yhteyttä lisätietoja varten.',
    },
  };

  // Current labels (merged with API labels)
  let labels: Record<string, string> = { ...defaults };

  // Current language
  let currentLanguage: string = 'en_US';

  /**
   * Language code mapping
   */
  const languageMap: LanguageMap = {
    en: 'en_US',
    es: 'es_ES',
    de: 'de_DE',
    fr: 'fr_FR',
    it: 'it_IT',
    pt: 'pt_PT',
    nl: 'nl_NL',
    ru: 'ru_RU',
    zh: 'zh_CN',
    ja: 'ja_JP',
    ar: 'ar_SA',
    sv: 'sv_SE',
    no: 'no_NO',
    da: 'da_DK',
    fi: 'fi_FI',
    pl: 'pl_PL',
  };

  /**
   * Map a short language code to full locale format
   */
  function mapLanguageCode(code: string): string {
    if (!code) return 'en_US';

    // Already in full format (e.g., es_ES)
    if (/^[a-z]{2}_[A-Z]{2}$/.test(code)) {
      return code;
    }

    // Convert hyphen format (e.g., en-US -> en_US)
    if (code.includes('-')) {
      const converted = code.replace('-', '_');
      if (/^[a-z]{2}_[A-Z]{2}$/.test(converted)) {
        return converted;
      }
      // Extract short code if full format doesn't match
      code = code.split('-')[0];
    }

    // Map short code to full format
    const shortCode = code.toLowerCase();
    return languageMap[shortCode] || 'en_US';
  }

  /**
   * Check if a language code is valid (exists in our language map)
   */
  function isValidLanguageCode(code: string): boolean {
    if (!code) return false;

    // Check short code
    const shortCode = code.toLowerCase().split(/[-_]/)[0];
    return !!languageMap[shortCode];
  }

  /**
   * Get GTranslate language from cookie
   * GTranslate stores language in 'googtrans' cookie as '/en/es' (from/to)
   */
  function getGTranslateLanguage(): string | null {
    try {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'googtrans' && value) {
          // Format: /en/es (from/to) - we want the target language
          const match = value.match(/\/[a-z]{2}\/([a-z]{2})/);
          if (match && isValidLanguageCode(match[1])) {
            return match[1];
          }
        }
      }
    } catch (e) {
      // Cookie access may fail in some contexts
    }
    return null;
  }

  /**
   * Detect language from URL subdomain (e.g., es.example.com)
   */
  function detectSubdomainLanguage(): string | null {
    try {
      const hostname = window.location.hostname;
      // Match patterns like es.example.com, de.example.com
      // Exclude www and common non-language subdomains
      const match = hostname.match(/^([a-z]{2})\./);
      if (match && match[1] !== 'ww' && isValidLanguageCode(match[1])) {
        return match[1];
      }
    } catch (e) {
      // Hostname access may fail
    }
    return null;
  }

  /**
   * Detect language from URL path (e.g., /es/, /de/)
   */
  function detectUrlLanguage(): string | null {
    try {
      // Match patterns like /es/, /de/, /fr/ at the start of the path
      const match = window.location.pathname.match(/^\/([a-z]{2})(?:\/|$)/);
      if (match && isValidLanguageCode(match[1])) {
        return match[1];
      }
    } catch (e) {
      // Pathname access may fail
    }
    return null;
  }

  /**
   * Detect language from translation plugins and platforms
   * Supports: Polylang, WPML, Weglot, GTranslate, Webflow, URL patterns
   */
  function detectPlatformLanguage(): string | null {
    // === WordPress Plugins ===

    // Check Polylang (WordPress)
    if (typeof window.pll_current_language === 'string' && window.pll_current_language) {
      console.log('[RealtySoft Labels] Detected Polylang language:', window.pll_current_language);
      return window.pll_current_language;
    }

    // Check WPML (WordPress)
    if (typeof window.icl_current_language === 'string' && window.icl_current_language) {
      console.log('[RealtySoft Labels] Detected WPML language:', window.icl_current_language);
      return window.icl_current_language;
    }

    // Check Weglot (WordPress + standalone)
    if (typeof window.Weglot?.getCurrentLang === 'function') {
      try {
        const weglotLang = window.Weglot.getCurrentLang();
        if (weglotLang) {
          console.log('[RealtySoft Labels] Detected Weglot language:', weglotLang);
          return weglotLang;
        }
      } catch (e) {
        // Weglot API may throw
      }
    }

    // Check GTranslate (via cookie)
    const gtranslateLang = getGTranslateLanguage();
    if (gtranslateLang) {
      console.log('[RealtySoft Labels] Detected GTranslate language:', gtranslateLang);
      return gtranslateLang;
    }

    // === Non-WordPress Platforms ===

    // Check Webflow locale
    if (typeof window.Webflow?.env === 'function') {
      try {
        const locale = window.Webflow.env('locale');
        if (locale) {
          console.log('[RealtySoft Labels] Detected Webflow locale:', locale);
          return locale;
        }
      } catch (e) {
        // Webflow API may throw
      }
    }

    // === Universal Detection (URL-based) ===

    // Check URL subdomain (es.site.com)
    const subdomainLang = detectSubdomainLanguage();
    if (subdomainLang) {
      console.log('[RealtySoft Labels] Detected subdomain language:', subdomainLang);
      return subdomainLang;
    }

    // Check URL path pattern (/es/, /de/)
    const urlLang = detectUrlLanguage();
    if (urlLang) {
      console.log('[RealtySoft Labels] Detected URL path language:', urlLang);
      return urlLang;
    }

    // Check ?lang= query parameter
    try {
      const params = new URLSearchParams(window.location.search);
      const langParam = params.get('lang');
      if (langParam && isValidLanguageCode(langParam)) {
        console.log('[RealtySoft Labels] Detected query param language:', langParam);
        return langParam;
      }
    } catch (e) {
      // URLSearchParams may fail in older browsers
    }

    return null;
  }

  /**
   * Detect language from browser/document with platform detection
   */
  function detectLanguage(): string {
    // Priority 1: Explicit config override (handled in controller, but check here too)
    if (typeof window !== 'undefined' && window.RealtySoftConfig?.language) {
      return mapLanguageCode(window.RealtySoftConfig.language);
    }

    // Priority 2: User stored preference
    try {
      const stored = localStorage.getItem('rs_language');
      if (stored && isValidLanguageCode(stored)) {
        return stored;
      }
    } catch (e) {
      // localStorage may be unavailable
    }

    // Priority 3: Platform/Plugin detection (WordPress plugins, Webflow, URL patterns)
    const platformLang = detectPlatformLanguage();
    if (platformLang) {
      return mapLanguageCode(platformLang);
    }

    // Priority 4: HTML lang attribute
    const htmlLang = document.documentElement.lang;
    if (htmlLang) {
      const shortLang = htmlLang.split('-')[0].toLowerCase();
      if (languageMap[shortLang]) {
        return languageMap[shortLang];
      }
    }

    // Priority 5: Browser language
    let lang: string | undefined =
      navigator.language || (navigator as Navigator & { userLanguage?: string }).userLanguage;

    if (lang) {
      // Convert 'en-US' to 'en_US' format
      lang = lang.replace('-', '_');

      // Check if exact match exists
      if (lang.includes('_')) {
        return lang;
      }

      // Map short code to full format
      if (languageMap[lang.toLowerCase()]) {
        return languageMap[lang.toLowerCase()];
      }
    }

    // Priority 6: Default
    return 'en_US';
  }

  /**
   * Initialize labels
   */
  function init(language: string | null = null): string {
    currentLanguage = language || detectLanguage();
    return currentLanguage;
  }

  /**
   * Initialize labels with static defaults only (no API call).
   * Used when labelsMode is 'static' or as first step in 'hybrid' mode.
   */
  function initStatic(language: string): void {
    currentLanguage = language;
    const langDefaults = languageDefaults[language] || {};
    labels = { ...defaults, ...langDefaults };
    console.log('[RealtySoft Labels] Initialized static labels for:', language, '- Total labels:', Object.keys(labels).length);
  }

  /**
   * Load labels from API
   */
  async function loadFromAPI(apiLabels: Record<string, string>): Promise<void> {
    // Merge order: English defaults → API labels → language-specific defaults
    // Language-specific defaults take priority to ensure translations work
    const langDefaults = languageDefaults[currentLanguage] || {};
    const langDefaultCount = Object.keys(langDefaults).length;

    if (apiLabels && typeof apiLabels === 'object') {
      const labelCount = Object.keys(apiLabels).length;
      console.log(
        '[RealtySoft Labels] Loading',
        labelCount,
        'API labels +',
        langDefaultCount,
        'language defaults for:',
        currentLanguage
      );
      // Language defaults take priority over API labels to ensure translations work
      labels = { ...defaults, ...apiLabels, ...langDefaults };
    } else {
      console.log('[RealtySoft Labels] No API labels, using defaults +', langDefaultCount, 'language defaults');
      labels = { ...defaults, ...langDefaults };
    }
  }

  /**
   * Check if overrides use the new per-language format
   * New format: { _default: { key: value }, es_ES: { key: value } }
   * Old format: { key: value }
   */
  function isPerLanguageFormat(overrides: LabelOverrides): overrides is Record<string, Record<string, string>> {
    if (!overrides || typeof overrides !== 'object') return false;
    const keys = Object.keys(overrides);
    // Check if keys look like language codes or _default
    return keys.some(key => key === '_default' || /^[a-z]{2}_[A-Z]{2}$/.test(key));
  }

  /**
   * Apply client-specific label overrides.
   * Supports two formats:
   * - Flat format (legacy): { search_button: 'Find' }
   * - Per-language format: { _default: { search_button: 'Find' }, es_ES: { search_button: 'Buscar' } }
   */
  function applyOverrides(overrides: LabelOverrides, language?: string): void {
    if (!overrides || typeof overrides !== 'object') return;

    const lang = language || currentLanguage;

    if (isPerLanguageFormat(overrides)) {
      // New per-language format
      let appliedCount = 0;

      // Apply _default overrides first (all languages)
      const defaultOverrides = overrides['_default'];
      if (defaultOverrides && typeof defaultOverrides === 'object') {
        labels = { ...labels, ...defaultOverrides };
        appliedCount += Object.keys(defaultOverrides).length;
      }

      // Then apply language-specific overrides (takes priority)
      const langOverrides = overrides[lang];
      if (langOverrides && typeof langOverrides === 'object') {
        labels = { ...labels, ...langOverrides };
        appliedCount += Object.keys(langOverrides).length;
      }

      console.log('[RealtySoft Labels] Applied', appliedCount, 'per-language overrides for:', lang);
    } else {
      // Legacy flat format - apply directly
      const flatOverrides = overrides as Record<string, string>;
      const overrideCount = Object.keys(flatOverrides).length;
      console.log('[RealtySoft Labels] Applying', overrideCount, 'client label overrides');
      labels = { ...labels, ...flatOverrides };
    }
  }

  /**
   * Reload labels for a new language
   */
  async function reloadForLanguage(newLanguage: string): Promise<void> {
    console.log('[RealtySoft Labels] Reloading labels for language:', newLanguage);
    currentLanguage = newLanguage;

    // Reset to defaults + language-specific defaults
    const langDefaults = languageDefaults[newLanguage] || {};
    labels = { ...defaults, ...langDefaults };

    // Labels will be reloaded by the controller when it detects language change
  }

  /**
   * Get a label with optional replacements
   */
  function get(key: string, replacements: Record<string, string | number> = {}): string {
    let label = labels[key] || defaults[key] || key;

    // Replace placeholders like {count}
    for (const [placeholder, value] of Object.entries(replacements)) {
      label = label.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), String(value));
    }

    return label;
  }

  /**
   * Get all labels
   */
  function getAll(): Record<string, string> {
    return { ...labels };
  }

  /**
   * Get current language
   */
  function getLanguage(): string {
    return currentLanguage;
  }

  /**
   * Set language
   */
  function setLanguage(lang: string): void {
    currentLanguage = lang;
  }

  /**
   * Format price based on locale
   */
  function formatPrice(price: number | null | undefined, currency: string = 'EUR'): string {
    if (price === null || price === undefined) return '';

    try {
      const locale = currentLanguage.replace('_', '-');
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price);
    } catch (e) {
      return `\u20AC${price.toLocaleString()}`;
    }
  }

  /**
   * Format number based on locale
   */
  function formatNumber(number: number | null | undefined): string {
    if (number === null || number === undefined) return '';

    try {
      const locale = currentLanguage.replace('_', '-');
      return new Intl.NumberFormat(locale).format(number);
    } catch (e) {
      return number.toLocaleString();
    }
  }

  /**
   * Format area (m\u00B2)
   */
  function formatArea(value: number | null | undefined): string {
    if (!value) return '';
    return `${formatNumber(value)} m\u00B2`;
  }

  // Public API
  return {
    init,
    initStatic,
    loadFromAPI,
    applyOverrides,
    reloadForLanguage,
    get,
    getAll,
    getLanguage,
    setLanguage,
    detectLanguage,
    mapLanguage: mapLanguageCode,
    formatPrice,
    formatNumber,
    formatArea,
  };
})();

// Assign to window for backwards compatibility
if (typeof window !== 'undefined') {
  (window as unknown as { RealtySoftLabels: RealtySoftLabelsModule }).RealtySoftLabels =
    RealtySoftLabels;
}

// Export for ES modules
export { RealtySoftLabels };
export default RealtySoftLabels;
