=== Smart Property Widget ===
Contributors: smartpropertywidget
Tags: real estate, property, rewrite, SEO, listings
Requires at least: 5.0
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 1.2.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Connects your WordPress site with Smart Property Widget for real estate listings. Enables SEO-friendly property detail URLs.

== Description ==

The Smart Property Widget plugin adds WordPress rewrite rules so that property detail URLs like `/property/villa-name-REF123` serve your `/property/` page with an HTTP 200 status instead of a 404 error.

**Why is this needed?**

When you create a WordPress page at `/property/` and embed the Smart Property Widget, clicking a property card navigates to `/property/villa-name-REF123`. WordPress doesn't recognize this sub-path and returns a 404 error. This plugin fixes that by telling WordPress to serve the `/property/` page for any URL matching `/property/*`.

**Features:**

* SEO-friendly property URLs with HTTP 200 status
* Multi-language support (e.g. `/property/`, `/propiedad/`, `/immobilie/`)
* Settings page for easy slug configuration
* Automatic rewrite rule management
* Auto-inject widget scripts (no manual code needed)
* Email branding configuration
* Clean uninstall (rules removed on deactivation)

== Installation ==

1. Download the plugin zip file
2. Go to WordPress Admin > Plugins > Add New > Upload Plugin
3. Upload the zip and click "Install Now"
4. Activate the plugin
5. Go to Settings > Smart Property Widget to configure your property page slugs

**Quick Setup:**

1. Create a WordPress page at `/property/` (or your preferred slug)
2. Add the Smart Property Widget embed code to that page
3. Activate this plugin (default slug `property` works out of the box)
4. Property detail URLs now work with HTTP 200

== Frequently Asked Questions ==

= Do I need to configure anything? =

The default slug `property` works out of the box. If your property page uses a different slug (e.g. `/properties/` or `/propiedad/`), go to Settings > Smart Property Widget and update it.

= How do I add multiple languages? =

Go to Settings > Smart Property Widget and click "+ Add Language" for each language slug. For example:
* English: `property`
* Spanish: `propiedad`
* German: `immobilie`

Each slug needs a corresponding WordPress page with the Smart Property Widget.

= Property URLs still show 404 after activating =

Go to Settings > Permalinks and click "Save Changes" to flush rewrite rules.

= Does this affect other pages? =

No. The rewrite rule only matches URLs under your configured slugs (e.g. `/property/*`). All other URLs work normally.

= What happens when I deactivate the plugin? =

The rewrite rules are automatically removed and WordPress permalinks are flushed.

== Changelog ==

= 1.2.0 =
* Rebrand to Smart Property Widget
* Add email branding configuration
* Improved Outlook/Gmail email compatibility

= 1.1.0 =
* Auto-inject widget scripts
* OG tags for social sharing
* Analytics integration

= 1.0.0 =
* Initial release
* Rewrite rule for property detail URLs
* Multi-language slug support
* Settings page with add/remove slug UI
* Auto-flush on activation/deactivation
