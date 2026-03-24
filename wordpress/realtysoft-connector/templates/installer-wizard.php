<?php
/**
 * RealtySoft Installer Wizard Template
 */

if (!defined('ABSPATH')) exit;
?>
<div class="rs-installer">
    <div class="rs-installer__container">
        <!-- Progress Steps -->
        <div class="rs-installer__steps">
            <div class="rs-step <?php echo $current_step >= 1 ? 'active' : ''; ?> <?php echo $current_step > 1 ? 'completed' : ''; ?>">
                <span class="rs-step__number">1</span>
                <span class="rs-step__label">License</span>
            </div>
            <div class="rs-step <?php echo $current_step >= 2 ? 'active' : ''; ?> <?php echo $current_step > 2 ? 'completed' : ''; ?>">
                <span class="rs-step__number">2</span>
                <span class="rs-step__label">API Setup</span>
            </div>
            <div class="rs-step <?php echo $current_step >= 3 ? 'active' : ''; ?> <?php echo $current_step > 3 ? 'completed' : ''; ?>">
                <span class="rs-step__number">3</span>
                <span class="rs-step__label">Languages</span>
            </div>
            <div class="rs-step <?php echo $current_step >= 4 ? 'active' : ''; ?>">
                <span class="rs-step__number">4</span>
                <span class="rs-step__label">Complete</span>
            </div>
        </div>

        <!-- Step Content -->
        <div class="rs-installer__content">
            <!-- Step 1: License -->
            <div class="rs-step-content" data-step="1" <?php echo $current_step !== 1 ? 'style="display:none;"' : ''; ?>>
                <h2>Enter Your License Key</h2>
                <p>Enter the license key you received when you purchased Smart Property Widget.</p>

                <?php if ($license_status['status'] === 'active'): ?>
                <div class="rs-notice rs-notice--success">
                    <strong>License Active!</strong> Your license is already activated.
                    Plan: <?php echo esc_html($license_status['plan']['name'] ?? 'Unknown'); ?>
                </div>
                <?php endif; ?>

                <div class="rs-form-group">
                    <label for="license_key">License Key</label>
                    <input type="text" id="license_key" name="license_key"
                           placeholder="XXXX-XXXX-XXXX-XXXX"
                           value="<?php echo esc_attr($license_status['key']); ?>"
                           pattern="[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}">
                    <p class="description">Format: XXXX-XXXX-XXXX-XXXX</p>
                </div>

                <div class="rs-form-group">
                    <button type="button" id="validate-license" class="button button-secondary">
                        Validate License
                    </button>
                    <span id="license-status" class="rs-status"></span>
                </div>

                <div class="rs-installer__actions">
                    <button type="button" class="button button-primary rs-next-step" data-next="2"
                            <?php echo $license_status['status'] !== 'active' ? 'disabled' : ''; ?>>
                        Continue &rarr;
                    </button>
                </div>
            </div>

            <!-- Step 2: API Setup -->
            <div class="rs-step-content" data-step="2" style="display:none;">
                <h2>API Configuration</h2>
                <p>Enter your CRM API credentials. These are provided by your RealtySoft CRM administrator.</p>

                <div class="rs-form-group">
                    <label for="api_key">API Key *</label>
                    <input type="text" id="api_key" name="api_key"
                           placeholder="CP1-xxxxxxxx"
                           value="<?php echo esc_attr(get_option('realtysoft_api_key', '')); ?>">
                    <p class="description">Your CRM access token (starts with CP1-)</p>
                </div>

                <div class="rs-form-group">
                    <label for="api_url">API URL *</label>
                    <input type="url" id="api_url" name="api_url"
                           placeholder="https://crm.yourdomain.com"
                           value="<?php echo esc_attr(get_option('realtysoft_api_url', '')); ?>">
                    <p class="description">Your CRM API base URL</p>
                </div>

                <div class="rs-form-group">
                    <label for="contact_email">Contact Email *</label>
                    <input type="email" id="contact_email" name="contact_email"
                           placeholder="admin@example.com"
                           value="<?php echo esc_attr(get_bloginfo('admin_email')); ?>">
                    <p class="description">Email for property inquiries and notifications</p>
                </div>

                <div class="rs-installer__actions">
                    <button type="button" class="button rs-prev-step" data-prev="1">
                        &larr; Back
                    </button>
                    <button type="button" class="button button-primary" id="save-api-config">
                        Save & Continue &rarr;
                    </button>
                </div>
            </div>

            <!-- Step 3: Languages & Pages -->
            <div class="rs-step-content" data-step="3" style="display:none;">
                <h2>Create Property Pages</h2>
                <p>Select the languages you want to support and configure page slugs. We'll create the necessary pages automatically.</p>

                <div class="rs-form-group">
                    <label>Languages</label>
                    <div id="language-checkboxes" class="rs-checkbox-group">
                        <!-- Populated by JavaScript -->
                    </div>
                </div>

                <div id="language-configs">
                    <!-- Language-specific config panels will be added here -->
                </div>

                <div class="rs-installer__actions">
                    <button type="button" class="button rs-prev-step" data-prev="2">
                        &larr; Back
                    </button>
                    <button type="button" class="button button-primary" id="create-pages">
                        Create Pages &rarr;
                    </button>
                </div>
            </div>

            <!-- Step 4: Complete -->
            <div class="rs-step-content" data-step="4" style="display:none;">
                <h2>Setup Complete!</h2>

                <div class="rs-notice rs-notice--success">
                    <strong>Congratulations!</strong> Smart Property Widget has been set up successfully.
                </div>

                <h3>Created Pages</h3>
                <div id="created-pages-list">
                    <!-- Populated by JavaScript -->
                </div>

                <h3>Next Steps</h3>
                <ol>
                    <li>Visit your property search page to see the widget in action</li>
                    <li>Customize the widget appearance in <a href="<?php echo admin_url('options-general.php?page=realtysoft-settings&tab=settings'); ?>">Settings</a></li>
                    <li>Add property widgets to other pages using HTML elements</li>
                </ol>

                <h3>Quick Reference</h3>
                <p>Add these HTML elements to any page to display widget components:</p>
                <pre class="rs-code-block">&lt;!-- Property Search Form --&gt;
&lt;div class="rs-search-template-01"&gt;&lt;/div&gt;

&lt;!-- Property Grid/Listing --&gt;
&lt;div class="rs-listing-template-01"&gt;&lt;/div&gt;

&lt;!-- Property Detail (for detail page) --&gt;
&lt;div class="property-detail-container"&gt;&lt;/div&gt;

&lt;!-- Wishlist --&gt;
&lt;div class="rs_wishlist_list"&gt;&lt;/div&gt;</pre>

                <div class="rs-installer__actions">
                    <a href="<?php echo admin_url('options-general.php?page=realtysoft-settings&tab=settings'); ?>" class="button button-primary">
                        Go to Settings
                    </a>
                    <a href="<?php echo home_url('/properties/'); ?>" class="button" target="_blank">
                        View Property Page
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
.rs-installer {
    max-width: 800px;
    margin: 20px auto;
}

.rs-installer__container {
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    overflow: hidden;
}

.rs-installer__steps {
    display: flex;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
}

.rs-step {
    flex: 1;
    padding: 20px;
    text-align: center;
    position: relative;
}

.rs-step::after {
    content: '';
    position: absolute;
    top: 50%;
    right: 0;
    width: 0;
    height: 0;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    border-left: 10px solid #e2e8f0;
    transform: translateY(-50%);
}

.rs-step:last-child::after {
    display: none;
}

.rs-step__number {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #e2e8f0;
    color: #64748b;
    font-weight: 600;
    margin-bottom: 8px;
}

.rs-step.active .rs-step__number {
    background: #3b82f6;
    color: white;
}

.rs-step.completed .rs-step__number {
    background: #10b981;
    color: white;
}

.rs-step__label {
    display: block;
    font-size: 13px;
    color: #64748b;
}

.rs-step.active .rs-step__label {
    color: #1e293b;
    font-weight: 500;
}

.rs-installer__content {
    padding: 30px;
}

.rs-step-content h2 {
    margin-top: 0;
    margin-bottom: 10px;
}

.rs-step-content > p {
    color: #64748b;
    margin-bottom: 25px;
}

.rs-form-group {
    margin-bottom: 20px;
}

.rs-form-group label {
    display: block;
    font-weight: 500;
    margin-bottom: 6px;
}

.rs-form-group input[type="text"],
.rs-form-group input[type="email"],
.rs-form-group input[type="url"] {
    width: 100%;
    max-width: 400px;
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 14px;
}

.rs-form-group input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.rs-form-group .description {
    margin-top: 4px;
    color: #6b7280;
    font-size: 13px;
}

.rs-checkbox-group {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
}

.rs-checkbox-group label {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
}

.rs-installer__actions {
    display: flex;
    gap: 10px;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #e2e8f0;
}

.rs-notice {
    padding: 15px;
    border-radius: 6px;
    margin-bottom: 20px;
}

.rs-notice--success {
    background: #dcfce7;
    color: #166534;
    border: 1px solid #86efac;
}

.rs-notice--error {
    background: #fee2e2;
    color: #b91c1c;
    border: 1px solid #fca5a5;
}

.rs-status {
    margin-left: 10px;
    font-size: 13px;
}

.rs-status.success {
    color: #10b981;
}

.rs-status.error {
    color: #ef4444;
}

.rs-code-block {
    background: #1e293b;
    color: #e2e8f0;
    padding: 15px;
    border-radius: 6px;
    font-size: 13px;
    overflow-x: auto;
}

.rs-language-config {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 15px;
    margin-bottom: 15px;
}

.rs-language-config h4 {
    margin-top: 0;
    margin-bottom: 15px;
}

.rs-language-config .rs-form-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
}

.rs-language-config input {
    width: 100%;
}

#created-pages-list {
    margin-bottom: 25px;
}

#created-pages-list ul {
    margin: 0;
    padding-left: 20px;
}

#created-pages-list li {
    margin-bottom: 5px;
}

#created-pages-list a {
    color: #3b82f6;
}
</style>

<script>
jQuery(document).ready(function($) {
    var currentStep = <?php echo $current_step; ?>;
    var licenseValid = <?php echo $license_status['status'] === 'active' ? 'true' : 'false'; ?>;
    var selectedLanguages = ['en'];
    var defaultSlugs = {
        'en': { detail: 'property', search: 'properties', wishlist: 'wishlist' },
        'es': { detail: 'propiedad', search: 'propiedades', wishlist: 'lista-de-deseos' },
        'de': { detail: 'immobilie', search: 'immobilien', wishlist: 'wunschliste' },
        'fr': { detail: 'propriete', search: 'proprietes', wishlist: 'liste-de-souhaits' },
        'nl': { detail: 'eigendom', search: 'eigendommen', wishlist: 'verlanglijst' },
    };

    // Initialize language checkboxes
    var languages = rsInstaller.languages || [{ code: 'en', name: 'English' }];
    var $langContainer = $('#language-checkboxes');

    languages.forEach(function(lang) {
        var checked = lang.code === 'en' ? 'checked' : '';
        $langContainer.append(
            '<label><input type="checkbox" name="languages[]" value="' + lang.code + '" ' + checked + '> ' + lang.name + '</label>'
        );
    });

    // Update language configs when checkboxes change
    $langContainer.on('change', 'input[type="checkbox"]', function() {
        updateLanguageConfigs();
    });

    function updateLanguageConfigs() {
        selectedLanguages = [];
        $langContainer.find('input:checked').each(function() {
            selectedLanguages.push($(this).val());
        });

        var $configs = $('#language-configs');
        $configs.empty();

        selectedLanguages.forEach(function(lang) {
            var slugs = defaultSlugs[lang] || defaultSlugs['en'];
            var langName = languages.find(function(l) { return l.code === lang; })?.name || lang;

            $configs.append(
                '<div class="rs-language-config" data-lang="' + lang + '">' +
                    '<h4>' + langName + ' Page Slugs</h4>' +
                    '<div class="rs-form-row">' +
                        '<div class="rs-form-group">' +
                            '<label>Property Detail</label>' +
                            '<input type="text" name="slugs[' + lang + '][detail]" value="' + slugs.detail + '">' +
                        '</div>' +
                        '<div class="rs-form-group">' +
                            '<label>Search/Listing</label>' +
                            '<input type="text" name="slugs[' + lang + '][search]" value="' + slugs.search + '">' +
                        '</div>' +
                        '<div class="rs-form-group">' +
                            '<label>Wishlist</label>' +
                            '<input type="text" name="slugs[' + lang + '][wishlist]" value="' + slugs.wishlist + '">' +
                        '</div>' +
                    '</div>' +
                '</div>'
            );
        });
    }

    // Initial language config
    updateLanguageConfigs();

    // Step navigation
    $('.rs-next-step').on('click', function() {
        var next = $(this).data('next');
        goToStep(next);
    });

    $('.rs-prev-step').on('click', function() {
        var prev = $(this).data('prev');
        goToStep(prev);
    });

    function goToStep(step) {
        $('.rs-step-content').hide();
        $('.rs-step-content[data-step="' + step + '"]').show();

        $('.rs-step').removeClass('active completed');
        $('.rs-step').each(function(i) {
            if (i + 1 < step) {
                $(this).addClass('completed');
            }
            if (i + 1 === step) {
                $(this).addClass('active');
            }
        });

        currentStep = step;
    }

    // Validate license
    $('#validate-license').on('click', function() {
        var $btn = $(this);
        var $status = $('#license-status');
        var licenseKey = $('#license_key').val().trim().toUpperCase();

        if (!licenseKey) {
            $status.text('Please enter a license key').removeClass('success').addClass('error');
            return;
        }

        $btn.prop('disabled', true).text('Validating...');
        $status.text('');

        $.ajax({
            url: rsInstaller.ajaxUrl,
            type: 'POST',
            data: {
                action: 'realtysoft_installer',
                installer_action: 'validate_license',
                nonce: rsInstaller.nonce,
                license_key: licenseKey
            },
            success: function(response) {
                if (response.success) {
                    var plan = response.data.plan;
                    var client = response.data.client;

                    $status.text('Valid! Plan: ' + (plan?.name || 'Standard'))
                           .removeClass('error').addClass('success');
                    licenseValid = true;
                    $('.rs-next-step[data-next="2"]').prop('disabled', false);

                    // Pre-fill API fields from dashboard data
                    if (client) {
                        if (client.api_key) $('#api_key').val(client.api_key);
                        if (client.api_url) $('#api_url').val(client.api_url);
                        if (client.owner_email) $('#contact_email').val(client.owner_email);
                    }

                    // Auto-skip step 2 if all fields are filled
                    if (client && client.api_key && client.api_url && client.owner_email) {
                        $status.text('Valid! Configured from dashboard.')
                               .removeClass('error').addClass('success');
                        // Auto-activate and skip to step 3
                        $('#save-api-config').trigger('click');
                    }
                } else {
                    $status.text(response.data.message || 'Invalid license').removeClass('success').addClass('error');
                    licenseValid = false;
                }
            },
            error: function() {
                $status.text('Connection error').removeClass('success').addClass('error');
            },
            complete: function() {
                $btn.prop('disabled', false).text('Validate License');
            }
        });
    });

    // Save API config
    $('#save-api-config').on('click', function() {
        var $btn = $(this);
        var apiKey = $('#api_key').val().trim();
        var apiUrl = $('#api_url').val().trim();
        var contactEmail = $('#contact_email').val().trim();

        if (!apiKey || !apiUrl || !contactEmail) {
            alert('Please fill in all required fields');
            return;
        }

        $btn.prop('disabled', true).text('Saving...');

        $.ajax({
            url: rsInstaller.ajaxUrl,
            type: 'POST',
            data: {
                action: 'realtysoft_installer',
                installer_action: 'activate_license',
                nonce: rsInstaller.nonce,
                license_key: $('#license_key').val().trim().toUpperCase(),
                api_key: apiKey,
                api_url: apiUrl,
                contact_email: contactEmail
            },
            success: function(response) {
                if (response.success) {
                    goToStep(3);
                } else {
                    alert(response.data.message || 'Failed to save configuration');
                }
            },
            error: function() {
                alert('Connection error');
            },
            complete: function() {
                $btn.prop('disabled', false).text('Save & Continue →');
            }
        });
    });

    // Create pages
    $('#create-pages').on('click', function() {
        var $btn = $(this);
        var slugs = {};

        $('.rs-language-config').each(function() {
            var lang = $(this).data('lang');
            slugs[lang] = {
                detail: $(this).find('input[name$="[detail]"]').val(),
                search: $(this).find('input[name$="[search]"]').val(),
                wishlist: $(this).find('input[name$="[wishlist]"]').val()
            };
        });

        $btn.prop('disabled', true).text('Creating pages...');

        $.ajax({
            url: rsInstaller.ajaxUrl,
            type: 'POST',
            data: {
                action: 'realtysoft_installer',
                installer_action: 'create_pages',
                nonce: rsInstaller.nonce,
                languages: selectedLanguages,
                slugs: slugs
            },
            success: function(response) {
                if (response.success) {
                    // Show created pages
                    var $list = $('#created-pages-list');
                    $list.html('<ul></ul>');
                    var $ul = $list.find('ul');

                    Object.keys(response.data.pages).forEach(function(lang) {
                        var langName = languages.find(function(l) { return l.code === lang; })?.name || lang;
                        $ul.append('<li><strong>' + langName + ':</strong> Pages created successfully</li>');
                    });

                    goToStep(4);
                } else {
                    alert(response.data.message || 'Failed to create pages');
                }
            },
            error: function() {
                alert('Connection error');
            },
            complete: function() {
                $btn.prop('disabled', false).text('Create Pages →');
            }
        });
    });
});
</script>
