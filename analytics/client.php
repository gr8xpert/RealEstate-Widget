<?php
/**
 * RealtySoft Widget v2 - Client Analytics Dashboard
 * Each client can view their own analytics data
 *
 * Access: /analytics/client.php?client=domain.com
 */

// Load client credentials
$credentialsFile = __DIR__ . '/../config/analytics-clients.php';
$clientCredentials = file_exists($credentialsFile) ? require $credentialsFile : [];

// Get client from URL
$clientParam = $_GET['client'] ?? '';
$clientParam = preg_replace('/^www\./', '', $clientParam);

// Validate client exists
if (!isset($clientCredentials[$clientParam])) {
    http_response_code(403);
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Access Denied</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f3f4f6; }
            .error-box { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
            h2 { color: #ef4444; margin-bottom: 10px; }
            p { color: #6b7280; line-height: 1.6; }
        </style>
    </head>
    <body>
        <div class="error-box">
            <h2>Access Denied</h2>
            <p>The client ID in the URL is not recognized or does not have analytics access.</p>
            <p style="margin-top: 20px; font-size: 14px;">Please contact your administrator for the correct analytics URL.</p>
        </div>
    </body>
    </html>
    <?php
    exit;
}

$clientConfig = $clientCredentials[$clientParam];
$clientDomain = $clientConfig['domain'] ?? $clientParam;
$displayName = $clientConfig['display_name'] ?? $clientParam;

session_start();

// Handle logout
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: client.php?client=' . urlencode($clientParam));
    exit;
}

// Session key for this specific client
$sessionKey = 'client_auth_' . md5($clientParam);
$isLoggedIn = isset($_SESSION[$sessionKey]) && $_SESSION[$sessionKey] === true;

// Handle login
if (!$isLoggedIn && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    if ($username === $clientConfig['username'] && password_verify($password, $clientConfig['password'])) {
        $_SESSION[$sessionKey] = true;
        header('Location: client.php?client=' . urlencode($clientParam));
        exit;
    }
    $loginError = 'Invalid username or password';
}

// Show login form if not authenticated
if (!$isLoggedIn) {
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login - <?php echo htmlspecialchars($displayName); ?> Analytics</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; }
            .login-card { background: white; padding: 40px; border-radius: 20px; box-shadow: 0 25px 50px rgba(0,0,0,0.25); width: 100%; max-width: 420px; }
            .logo { text-align: center; margin-bottom: 30px; }
            .logo h1 { font-size: 28px; color: #1f2937; margin-bottom: 8px; }
            .logo p { color: #6b7280; }
            .client-badge { background: #f3f4f6; padding: 12px 20px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
            .client-badge strong { color: #1f2937; font-size: 16px; }
            .form-group { margin-bottom: 20px; }
            label { display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px; }
            input { width: 100%; padding: 14px 16px; border: 2px solid #e5e7eb; border-radius: 10px; font-size: 16px; transition: all 0.2s; }
            input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
            .error { background: #fef2f2; color: #dc2626; padding: 12px 16px; border-radius: 10px; margin-bottom: 20px; font-size: 14px; border-left: 4px solid #dc2626; }
            button { width: 100%; padding: 16px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
            button:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3); }
            .footer { text-align: center; margin-top: 30px; font-size: 13px; color: #9ca3af; }
        </style>
    </head>
    <body>
        <div class="login-card">
            <div class="logo">
                <h1>Analytics Dashboard</h1>
                <p>View your property widget analytics</p>
            </div>

            <div class="client-badge">
                <strong><?php echo htmlspecialchars($displayName); ?></strong>
            </div>

            <?php if (isset($loginError)): ?>
                <div class="error"><?php echo htmlspecialchars($loginError); ?></div>
            <?php endif; ?>

            <form method="POST">
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" name="username" required autofocus placeholder="Enter your username">
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" name="password" required placeholder="Enter your password">
                </div>
                <button type="submit">Sign In</button>
            </form>

            <div class="footer">
                Powered by RealtySoft Widget
            </div>
        </div>
    </body>
    </html>
    <?php
    exit;
}

// User is authenticated - show dashboard
$apiBase = '../php/analytics-api.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($displayName); ?> - Analytics Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
            --primary: #6366f1;
            --primary-dark: #4f46e5;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --bg-card: #ffffff;
            --text-primary: #1f2937;
            --text-secondary: #6b7280;
            --border: #e5e7eb;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f3f4f6;
            color: var(--text-primary);
            min-height: 100vh;
        }

        .header {
            background: linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%);
            color: white;
            padding: 20px 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
        }

        .header h1 { font-size: 22px; font-weight: 600; }
        .header p { opacity: 0.9; font-size: 14px; margin-top: 4px; }

        .header-actions { display: flex; gap: 10px; }

        .btn {
            padding: 10px 18px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            transition: all 0.2s;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }

        .btn-white { background: white; color: var(--primary); }
        .btn-white:hover { background: #f3f4f6; }
        .btn-ghost { background: rgba(255,255,255,0.15); color: white; }
        .btn-ghost:hover { background: rgba(255,255,255,0.25); }

        .container { padding: 30px; max-width: 1400px; margin: 0 auto; }

        .filters {
            background: var(--bg-card);
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            margin-bottom: 30px;
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
            align-items: flex-end;
        }

        .filter-group { display: flex; flex-direction: column; gap: 6px; }
        .filter-group label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; }
        .filter-group select, .filter-group input {
            padding: 10px 14px;
            border: 2px solid var(--border);
            border-radius: 8px;
            font-size: 14px;
            min-width: 140px;
        }
        .filter-group select:focus, .filter-group input:focus { outline: none; border-color: var(--primary); }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .stat-card {
            background: var(--bg-card);
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            border-left: 4px solid var(--primary);
        }

        .stat-card.views { border-left-color: var(--success); }
        .stat-card.clicks { border-left-color: var(--warning); }
        .stat-card.wishlist { border-left-color: #ec4899; }
        .stat-card.inquiries { border-left-color: var(--danger); }

        .stat-label { font-size: 13px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
        .stat-value { font-size: 32px; font-weight: 700; }

        .charts-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }

        @media (max-width: 900px) {
            .charts-grid { grid-template-columns: 1fr; }
        }

        .chart-card {
            background: var(--bg-card);
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .chart-card h3 { font-size: 16px; font-weight: 600; margin-bottom: 20px; }
        .chart-container { position: relative; height: 280px; }

        .table-card {
            background: var(--bg-card);
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            overflow: hidden;
        }

        .table-header {
            padding: 20px 24px;
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .table-header h3 { font-size: 16px; font-weight: 600; }

        table { width: 100%; border-collapse: collapse; }
        thead { background: #f9fafb; }
        th { text-align: left; padding: 12px 24px; font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; }
        td { padding: 16px 24px; border-top: 1px solid var(--border); font-size: 14px; }
        tr:hover { background: #f9fafb; }
        .property-ref { font-weight: 600; color: var(--primary); }
        .metric { font-weight: 600; font-size: 16px; }

        .loading, .no-data { text-align: center; padding: 50px 20px; color: var(--text-secondary); }
        .spinner { width: 36px; height: 36px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 12px; }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
            .header { padding: 15px; }
            .container { padding: 15px; }
            .filters { flex-direction: column; }
            .filter-group { width: 100%; }
            .filter-group select { width: 100%; }
            .stats-grid { grid-template-columns: 1fr 1fr; }
        }

        /* Property Analytics Tabs */
        .tabs { display: flex; gap: 5px; }
        .tab-btn {
            padding: 8px 16px;
            border: 2px solid var(--border);
            background: white;
            border-radius: 8px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 600;
            color: var(--text-secondary);
            transition: all 0.2s;
        }
        .tab-btn:hover { border-color: var(--primary); color: var(--primary); }
        .tab-btn.active { background: var(--primary); border-color: var(--primary); color: white; }

        .rankings-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; }
        .ranking-card { background: var(--bg-card); border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; }
        .ranking-card h4 { padding: 14px 18px; background: #f9fafb; border-bottom: 1px solid var(--border); font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
        .rank-icon { font-size: 16px; }
        .ranking-list { padding: 0; }
        .ranking-item { display: flex; align-items: center; padding: 10px 18px; border-bottom: 1px solid var(--border); gap: 10px; }
        .ranking-item:last-child { border-bottom: none; }
        .ranking-item:hover { background: #f9fafb; }
        .rank-number { width: 22px; height: 22px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
        .rank-number.gold { background: linear-gradient(135deg, #f59e0b, #d97706); }
        .rank-number.silver { background: linear-gradient(135deg, #9ca3af, #6b7280); }
        .rank-number.bronze { background: linear-gradient(135deg, #d97706, #b45309); }
        .ranking-info { flex: 1; min-width: 0; }
        .ranking-ref { font-weight: 600; color: var(--primary); font-size: 12px; cursor: pointer; }
        .ranking-ref:hover { text-decoration: underline; }
        .ranking-location { font-size: 10px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ranking-value { font-weight: 700; font-size: 15px; color: var(--text-primary); }

        .funnel-visual { padding: 20px; }
        .funnel-step { display: flex; align-items: center; margin-bottom: 10px; }
        .funnel-label { width: 120px; font-size: 12px; font-weight: 500; color: var(--text-secondary); }
        .funnel-bar-container { flex: 1; background: #f3f4f6; border-radius: 6px; height: 32px; overflow: hidden; position: relative; }
        .funnel-bar { height: 100%; background: linear-gradient(90deg, var(--primary), #8b5cf6); border-radius: 6px; transition: width 0.5s ease; display: flex; align-items: center; justify-content: flex-end; padding-right: 10px; }
        .funnel-value { color: white; font-weight: 700; font-size: 12px; text-shadow: 0 1px 2px rgba(0,0,0,0.2); }
        .funnel-percent { width: 50px; text-align: right; font-weight: 600; font-size: 12px; color: var(--text-primary); margin-left: 10px; }

        .conversion-cards { padding: 20px; }
        .conversion-card { background: #f9fafb; padding: 14px; border-radius: 8px; margin-bottom: 10px; }
        .conversion-card:last-child { margin-bottom: 0; }
        .conversion-label { font-size: 11px; color: var(--text-secondary); margin-bottom: 4px; }
        .conversion-value { font-size: 22px; font-weight: 700; color: var(--primary); }
        .conversion-value.highlight { color: var(--success); font-size: 26px; }

        .modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .modal-content { background: white; border-radius: 16px; max-width: 800px; width: 100%; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column; }
        .modal-header { padding: 18px 22px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
        .modal-header h3 { font-size: 16px; }
        .modal-close { width: 30px; height: 30px; border: none; background: #f3f4f6; border-radius: 6px; cursor: pointer; font-size: 18px; color: var(--text-secondary); }
        .modal-close:hover { background: #e5e7eb; }
        .modal-body { padding: 22px; overflow-y: auto; }
        .modal-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 14px; margin-bottom: 22px; }
        .modal-stat { text-align: center; padding: 14px; background: #f9fafb; border-radius: 8px; }
        .modal-stat-value { font-size: 24px; font-weight: 700; color: var(--primary); }
        .modal-stat-label { font-size: 10px; color: var(--text-secondary); text-transform: uppercase; margin-top: 4px; }
        .modal-chart-container { height: 180px; margin-bottom: 22px; }

        .pagination { display: flex; gap: 4px; align-items: center; }
        .pagination button { padding: 6px 10px; border: 1px solid var(--border); background: white; border-radius: 5px; cursor: pointer; font-size: 12px; }
        .pagination button:hover { background: #f3f4f6; }
        .pagination button.active { background: var(--primary); color: white; border-color: var(--primary); }
        .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Export Dropdown */
        .export-dropdown { position: relative; }
        .export-menu {
            display: none;
            position: absolute;
            top: 100%;
            right: 0;
            margin-top: 6px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            min-width: 200px;
            z-index: 100;
            overflow: hidden;
        }
        .export-menu.show { display: block; }
        .export-menu a {
            display: block;
            padding: 12px 18px;
            color: var(--text-primary);
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            border-bottom: 1px solid var(--border);
            transition: background 0.15s;
        }
        .export-menu a:last-child { border-bottom: none; }
        .export-menu a:hover { background: #f3f4f6; }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <h1><?php echo htmlspecialchars($displayName); ?></h1>
            <p>Analytics Dashboard</p>
        </div>
        <div class="header-actions">
            <div class="export-dropdown">
                <button class="btn btn-white" onclick="toggleExportMenu()">Export CSV &#9662;</button>
                <div class="export-menu" id="exportMenu">
                    <a href="#" onclick="exportCSV('export'); return false;">Raw Events</a>
                    <a href="#" onclick="exportCSV('export_properties'); return false;">Property Performance</a>
                    <a href="#" onclick="exportCSV('export_trends'); return false;">Daily Trends</a>
                    <a href="#" onclick="exportCSV('export_searches'); return false;">Search Insights</a>
                    <a href="#" onclick="exportCSV('export_funnel'); return false;">Conversion Funnel</a>
                </div>
            </div>
            <button class="btn btn-ghost" onclick="loadDashboard()">Refresh</button>
            <a href="?client=<?php echo urlencode($clientParam); ?>&logout=1" class="btn btn-ghost">Logout</a>
        </div>
    </div>

    <div class="container">
        <div class="filters">
            <div class="filter-group">
                <label>Period</label>
                <select id="filter-period" onchange="handlePeriodChange()">
                    <option value="today">Today</option>
                    <option value="week" selected>Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                    <option value="quarter">Last 90 Days</option>
                    <option value="all">All Time</option>
                    <option value="custom">Custom Range</option>
                </select>
            </div>
            <div class="filter-group" id="date-from-group" style="display: none;">
                <label>From</label>
                <input type="date" id="filter-date-from">
            </div>
            <div class="filter-group" id="date-to-group" style="display: none;">
                <label>To</label>
                <input type="date" id="filter-date-to">
            </div>
            <div class="filter-group" id="apply-btn-group" style="display: none;">
                <label>&nbsp;</label>
                <button class="btn btn-white" onclick="loadDashboard()" style="border: 2px solid var(--primary); color: var(--primary);">Apply</button>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Searches</div>
                <div class="stat-value" id="stat-searches">-</div>
            </div>
            <div class="stat-card views">
                <div class="stat-label">Property Views</div>
                <div class="stat-value" id="stat-views">-</div>
            </div>
            <div class="stat-card clicks">
                <div class="stat-label">Property Clicks</div>
                <div class="stat-value" id="stat-clicks">-</div>
            </div>
            <div class="stat-card wishlist">
                <div class="stat-label">Wishlist Adds</div>
                <div class="stat-value" id="stat-wishlist">-</div>
            </div>
            <div class="stat-card inquiries">
                <div class="stat-label">Inquiries</div>
                <div class="stat-value" id="stat-inquiries">-</div>
            </div>
        </div>

        <div class="charts-grid">
            <div class="chart-card">
                <h3>Activity Trends</h3>
                <div class="chart-container">
                    <canvas id="trendsChart"></canvas>
                </div>
            </div>
            <div class="chart-card">
                <h3>Event Breakdown</h3>
                <div class="chart-container">
                    <canvas id="distributionChart"></canvas>
                </div>
            </div>
        </div>

        <div class="table-card">
            <div class="table-header">
                <h3>Top Properties</h3>
            </div>

            <div id="properties-loading" class="loading">
                <div class="spinner"></div>
                <p>Loading...</p>
            </div>

            <table id="properties-table" style="display: none;">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Property Ref</th>
                        <th>Location</th>
                        <th>Views</th>
                        <th>Clicks</th>
                        <th>Wishlist</th>
                        <th>Inquiries</th>
                        <th>Users</th>
                    </tr>
                </thead>
                <tbody id="properties-tbody"></tbody>
            </table>

            <div id="properties-empty" class="no-data" style="display: none;">
                <p>No property data available for this period.</p>
            </div>
        </div>

        <!-- Property Analytics Section -->
        <div class="section-header" style="margin: 40px 0 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
            <h2 style="font-size: 18px; color: var(--text-primary);">Property Analytics</h2>
            <div class="tabs">
                <button class="tab-btn active" data-tab="rankings" onclick="switchPropertyTab('rankings')">Rankings</button>
                <button class="tab-btn" data-tab="table" onclick="switchPropertyTab('table')">All Properties</button>
                <button class="tab-btn" data-tab="funnel" onclick="switchPropertyTab('funnel')">Funnel</button>
            </div>
        </div>

        <div id="tab-rankings" class="property-tab">
            <div class="rankings-grid">
                <div class="ranking-card">
                    <h4><span class="rank-icon">👁️</span> Most Viewed</h4>
                    <div id="ranking-views" class="ranking-list"><div class="loading"><div class="spinner"></div></div></div>
                </div>
                <div class="ranking-card">
                    <h4><span class="rank-icon">❤️</span> Most Wishlisted</h4>
                    <div id="ranking-wishlist" class="ranking-list"><div class="loading"><div class="spinner"></div></div></div>
                </div>
                <div class="ranking-card">
                    <h4><span class="rank-icon">📧</span> Most Inquired</h4>
                    <div id="ranking-inquiries" class="ranking-list"><div class="loading"><div class="spinner"></div></div></div>
                </div>
                <div class="ranking-card">
                    <h4><span class="rank-icon">🔥</span> Top Engagement</h4>
                    <div id="ranking-engagement" class="ranking-list"><div class="loading"><div class="spinner"></div></div></div>
                </div>
            </div>
        </div>

        <div id="tab-table" class="property-tab" style="display: none;">
            <div class="table-card">
                <div class="table-header">
                    <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                        <input type="text" id="property-search" placeholder="Search..." style="padding: 8px 12px; border: 2px solid var(--border); border-radius: 6px; min-width: 180px;" onkeyup="debouncePropertySearch()">
                        <select id="property-sort" onchange="loadPropertyTable()" style="padding: 8px 12px; border: 2px solid var(--border); border-radius: 6px;">
                            <option value="views">Sort by Views</option>
                            <option value="clicks">Sort by Clicks</option>
                            <option value="wishlist_adds">Sort by Wishlist</option>
                            <option value="inquiries">Sort by Inquiries</option>
                            <option value="conversion_rate">Sort by Conversion</option>
                        </select>
                    </div>
                    <div id="property-table-pagination" class="pagination"></div>
                </div>
                <table id="property-detail-table">
                    <thead>
                        <tr>
                            <th>Property Ref</th>
                            <th>Location</th>
                            <th>Views</th>
                            <th>Clicks</th>
                            <th>Wishlist</th>
                            <th>Inquiries</th>
                            <th>Conv.</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="property-detail-tbody"></tbody>
                </table>
            </div>
        </div>

        <div id="tab-funnel" class="property-tab" style="display: none;">
            <div class="charts-grid">
                <div class="chart-card" style="flex: 2;">
                    <h3>Conversion Funnel</h3>
                    <div id="funnel-container" class="funnel-visual"><div class="loading"><div class="spinner"></div></div></div>
                </div>
                <div class="chart-card">
                    <h3>Conversion Rates</h3>
                    <div id="conversion-stats" class="conversion-cards"><div class="loading"><div class="spinner"></div></div></div>
                </div>
            </div>
        </div>

        <div id="property-modal" class="modal" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Property: <span id="modal-property-ref"></span></h3>
                    <button class="modal-close" onclick="closePropertyModal()">&times;</button>
                </div>
                <div class="modal-body" id="modal-body"><div class="loading"><div class="spinner"></div></div></div>
            </div>
        </div>
    </div>

    <script>
        const API_BASE = '<?php echo $apiBase; ?>';
        const CLIENT_ID = '<?php echo addslashes($clientDomain); ?>';
        let trendsChart, distributionChart;

        function handlePeriodChange() {
            const isCustom = document.getElementById('filter-period').value === 'custom';
            document.getElementById('date-from-group').style.display = isCustom ? 'flex' : 'none';
            document.getElementById('date-to-group').style.display = isCustom ? 'flex' : 'none';
            document.getElementById('apply-btn-group').style.display = isCustom ? 'flex' : 'none';
            if (!isCustom) loadDashboard();
        }

        function getFilterParams() {
            const period = document.getElementById('filter-period').value;
            const dateFrom = document.getElementById('filter-date-from').value;
            const dateTo = document.getElementById('filter-date-to').value;

            let params = new URLSearchParams();
            params.set('client_id', CLIENT_ID);

            if (period === 'custom' && dateFrom && dateTo) {
                params.set('date_from', dateFrom);
                params.set('date_to', dateTo);
            } else {
                params.set('period', period);
            }

            return params.toString();
        }

        async function loadDashboard() {
            await Promise.all([loadSummary(), loadTrends(), loadProperties()]);
        }

        async function loadSummary() {
            try {
                const res = await fetch(`${API_BASE}?action=summary&${getFilterParams()}`);
                const data = await res.json();
                if (data.success) {
                    document.getElementById('stat-searches').textContent = data.stats.searches.toLocaleString();
                    document.getElementById('stat-views').textContent = data.stats.property_views.toLocaleString();
                    document.getElementById('stat-clicks').textContent = data.stats.card_clicks.toLocaleString();
                    document.getElementById('stat-wishlist').textContent = data.stats.wishlist_adds.toLocaleString();
                    document.getElementById('stat-inquiries').textContent = data.stats.inquiries.toLocaleString();
                    updateDistributionChart(data.stats);
                }
            } catch (e) { console.error(e); }
        }

        async function loadTrends() {
            try {
                const res = await fetch(`${API_BASE}?action=trends&${getFilterParams()}`);
                const data = await res.json();
                if (data.success) updateTrendsChart(data.labels, data.datasets);
            } catch (e) { console.error(e); }
        }

        async function loadProperties() {
            const loading = document.getElementById('properties-loading');
            const table = document.getElementById('properties-table');
            const empty = document.getElementById('properties-empty');
            const tbody = document.getElementById('properties-tbody');

            loading.style.display = 'block';
            table.style.display = 'none';
            empty.style.display = 'none';

            try {
                const res = await fetch(`${API_BASE}?action=properties&${getFilterParams()}`);
                const data = await res.json();
                loading.style.display = 'none';

                if (!data.success || data.properties.length === 0) {
                    empty.style.display = 'block';
                    return;
                }

                tbody.innerHTML = data.properties.slice(0, 30).map((p, i) => `
                    <tr>
                        <td><strong>#${i+1}</strong></td>
                        <td class="property-ref">${p.property_ref || p.property_id || '-'}</td>
                        <td>${p.location || '-'}</td>
                        <td class="metric">${p.views || 0}</td>
                        <td class="metric">${p.clicks || 0}</td>
                        <td class="metric">${p.wishlist_adds || 0}</td>
                        <td class="metric">${p.inquiries || 0}</td>
                        <td>${p.unique_users || 0}</td>
                    </tr>
                `).join('');

                table.style.display = 'table';
            } catch (e) {
                console.error(e);
                loading.style.display = 'none';
                empty.style.display = 'block';
            }
        }

        function updateTrendsChart(labels, datasets) {
            const ctx = document.getElementById('trendsChart').getContext('2d');
            if (trendsChart) trendsChart.destroy();

            trendsChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        { label: 'Views', data: datasets.property_views, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', tension: 0.3, fill: true },
                        { label: 'Searches', data: datasets.searches, borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', tension: 0.3, fill: true },
                        { label: 'Inquiries', data: datasets.inquiries, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', tension: 0.3, fill: true }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } },
                    scales: { y: { beginAtZero: true } }
                }
            });
        }

        function updateDistributionChart(stats) {
            const ctx = document.getElementById('distributionChart').getContext('2d');
            if (distributionChart) distributionChart.destroy();

            distributionChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Searches', 'Views', 'Clicks', 'Wishlist', 'Inquiries'],
                    datasets: [{
                        data: [stats.searches, stats.property_views, stats.card_clicks, stats.wishlist_adds, stats.inquiries],
                        backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#ef4444']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } }
                }
            });
        }

        function exportCSV(type) {
            window.location.href = `${API_BASE}?action=${type}&${getFilterParams()}`;
            document.getElementById('exportMenu').classList.remove('show');
        }

        function toggleExportMenu() {
            document.getElementById('exportMenu').classList.toggle('show');
        }

        document.addEventListener('click', function(e) {
            if (!e.target.closest('.export-dropdown')) {
                document.getElementById('exportMenu').classList.remove('show');
            }
        });

        // ===== Property Analytics =====
        let propertyTablePage = 1;
        let propertySearchTimeout = null;
        let propertyDetailChart = null;

        function switchPropertyTab(tab) {
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tab));
            document.querySelectorAll('.property-tab').forEach(el => el.style.display = el.id === `tab-${tab}` ? 'block' : 'none');
            if (tab === 'rankings') loadPropertyRankings();
            if (tab === 'table') loadPropertyTable();
            if (tab === 'funnel') loadFunnelAnalysis();
        }

        async function loadPropertyRankings() {
            try {
                const res = await fetch(`${API_BASE}?action=property_rankings&${getFilterParams()}&limit=8`);
                const data = await res.json();
                if (data.success) {
                    renderRankingList('ranking-views', data.rankings.top_viewed, 'views');
                    renderRankingList('ranking-wishlist', data.rankings.top_wishlisted, 'wishlist_adds');
                    renderRankingList('ranking-inquiries', data.rankings.top_inquired, 'inquiries');
                    renderRankingList('ranking-engagement', data.rankings.top_engagement, 'total_engagement');
                }
            } catch (e) { console.error(e); }
        }

        function renderRankingList(containerId, items, valueKey) {
            const container = document.getElementById(containerId);
            if (!items || items.length === 0) {
                container.innerHTML = '<div class="no-data" style="padding: 15px;">No data</div>';
                return;
            }
            container.innerHTML = items.slice(0, 8).map((item, i) => {
                const rankClass = i === 0 ? 'gold' : (i === 1 ? 'silver' : (i === 2 ? 'bronze' : ''));
                return `<div class="ranking-item">
                    <div class="rank-number ${rankClass}">${i + 1}</div>
                    <div class="ranking-info">
                        <div class="ranking-ref" onclick="showPropertyDetail('${item.property_ref}')">${item.property_ref}</div>
                        <div class="ranking-location">${item.location || 'Unknown'}</div>
                    </div>
                    <div class="ranking-value">${item[valueKey].toLocaleString()}</div>
                </div>`;
            }).join('');
        }

        async function loadPropertyTable() {
            const sort = document.getElementById('property-sort').value;
            const search = document.getElementById('property-search').value;
            try {
                const res = await fetch(`${API_BASE}?action=property_table&${getFilterParams()}&sort=${sort}&order=desc&page=${propertyTablePage}&per_page=12&search=${encodeURIComponent(search)}`);
                const data = await res.json();
                if (data.success) {
                    renderPropertyTable(data.properties);
                    renderPagination(data.pagination);
                }
            } catch (e) { console.error(e); }
        }

        function renderPropertyTable(properties) {
            const tbody = document.getElementById('property-detail-tbody');
            if (!properties || properties.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 30px;">No properties found</td></tr>';
                return;
            }
            tbody.innerHTML = properties.map(p => `<tr>
                <td><span class="property-ref" style="cursor: pointer;" onclick="showPropertyDetail('${p.property_ref}')">${p.property_ref}</span></td>
                <td>${p.location || '-'}</td>
                <td class="metric">${p.views}</td>
                <td class="metric">${p.clicks}</td>
                <td class="metric">${p.wishlist_adds}</td>
                <td class="metric">${p.inquiries}</td>
                <td><span style="color: ${p.conversion_rate > 5 ? 'var(--success)' : 'inherit'}">${p.conversion_rate}%</span></td>
                <td><button class="btn btn-primary" style="padding: 5px 10px; font-size: 11px;" onclick="showPropertyDetail('${p.property_ref}')">Details</button></td>
            </tr>`).join('');
        }

        function renderPagination(pagination) {
            const container = document.getElementById('property-table-pagination');
            const { page, total_pages } = pagination;
            if (total_pages <= 1) { container.innerHTML = ''; return; }
            let html = `<button onclick="goToPage(${page - 1})" ${page === 1 ? 'disabled' : ''}>&lt;</button>`;
            for (let i = 1; i <= Math.min(total_pages, 5); i++) {
                html += `<button onclick="goToPage(${i})" class="${i === page ? 'active' : ''}">${i}</button>`;
            }
            if (total_pages > 5) html += `<span>...</span><button onclick="goToPage(${total_pages})">${total_pages}</button>`;
            html += `<button onclick="goToPage(${page + 1})" ${page === total_pages ? 'disabled' : ''}>&gt;</button>`;
            container.innerHTML = html;
        }

        function goToPage(page) { propertyTablePage = page; loadPropertyTable(); }
        function debouncePropertySearch() {
            clearTimeout(propertySearchTimeout);
            propertySearchTimeout = setTimeout(() => { propertyTablePage = 1; loadPropertyTable(); }, 300);
        }

        async function loadFunnelAnalysis() {
            try {
                const res = await fetch(`${API_BASE}?action=property_funnel&${getFilterParams()}`);
                const data = await res.json();
                if (data.success) { renderFunnel(data.funnel); renderConversions(data.conversions); }
            } catch (e) { console.error(e); }
        }

        function renderFunnel(funnel) {
            const container = document.getElementById('funnel-container');
            const maxCount = funnel.total_sessions.count;
            const steps = [
                { key: 'total_sessions', label: 'Sessions' },
                { key: 'searched', label: 'Searched' },
                { key: 'clicked_property', label: 'Clicked' },
                { key: 'viewed_detail', label: 'Viewed' },
                { key: 'added_wishlist', label: 'Wishlist' },
                { key: 'inquired', label: 'Inquiry' }
            ];
            container.innerHTML = steps.map(step => {
                const data = funnel[step.key];
                const width = maxCount > 0 ? (data.count / maxCount) * 100 : 0;
                return `<div class="funnel-step">
                    <div class="funnel-label">${step.label}</div>
                    <div class="funnel-bar-container">
                        <div class="funnel-bar" style="width: ${Math.max(width, 5)}%;">
                            <span class="funnel-value">${data.count}</span>
                        </div>
                    </div>
                    <div class="funnel-percent">${data.percentage}%</div>
                </div>`;
            }).join('');
        }

        function renderConversions(conv) {
            document.getElementById('conversion-stats').innerHTML = `
                <div class="conversion-card"><div class="conversion-label">Search → Click</div><div class="conversion-value">${conv.search_to_click}%</div></div>
                <div class="conversion-card"><div class="conversion-label">Click → View</div><div class="conversion-value">${conv.click_to_view}%</div></div>
                <div class="conversion-card"><div class="conversion-label">View → Wishlist</div><div class="conversion-value">${conv.view_to_wishlist}%</div></div>
                <div class="conversion-card"><div class="conversion-label">View → Inquiry</div><div class="conversion-value">${conv.view_to_inquiry}%</div></div>
                <div class="conversion-card"><div class="conversion-label">Overall</div><div class="conversion-value highlight">${conv.overall_conversion}%</div></div>
            `;
        }

        async function showPropertyDetail(propertyRef) {
            const modal = document.getElementById('property-modal');
            const modalBody = document.getElementById('modal-body');
            document.getElementById('modal-property-ref').textContent = propertyRef;
            modal.style.display = 'flex';
            modalBody.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
            try {
                const res = await fetch(`${API_BASE}?action=property_detail&${getFilterParams()}&property_ref=${encodeURIComponent(propertyRef)}`);
                const data = await res.json();
                if (data.success) renderPropertyModal(data.property);
                else modalBody.innerHTML = '<div class="no-data">Failed to load</div>';
            } catch (e) { modalBody.innerHTML = '<div class="no-data">Error</div>'; }
        }

        function renderPropertyModal(p) {
            const modalBody = document.getElementById('modal-body');
            modalBody.innerHTML = `
                <div class="modal-stats-grid">
                    <div class="modal-stat"><div class="modal-stat-value">${p.views}</div><div class="modal-stat-label">Views</div></div>
                    <div class="modal-stat"><div class="modal-stat-value">${p.clicks}</div><div class="modal-stat-label">Clicks</div></div>
                    <div class="modal-stat"><div class="modal-stat-value">${p.wishlist_adds}</div><div class="modal-stat-label">Wishlist</div></div>
                    <div class="modal-stat"><div class="modal-stat-value">${p.inquiries}</div><div class="modal-stat-label">Inquiries</div></div>
                    <div class="modal-stat"><div class="modal-stat-value">${p.unique_users}</div><div class="modal-stat-label">Users</div></div>
                    <div class="modal-stat"><div class="modal-stat-value">${p.inquiry_rate}%</div><div class="modal-stat-label">Conv.</div></div>
                </div>
                <h4 style="margin-bottom: 14px; font-size: 13px;">Activity Over Time</h4>
                <div class="modal-chart-container"><canvas id="propertyDetailChart"></canvas></div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 12px;">
                    <div>
                        <h4 style="margin-bottom: 10px; font-size: 13px;">Stats</h4>
                        <p style="padding: 6px 0; border-bottom: 1px solid var(--border);"><span style="color: var(--text-secondary);">Gallery Views:</span> <strong>${p.gallery_views}</strong></p>
                        <p style="padding: 6px 0; border-bottom: 1px solid var(--border);"><span style="color: var(--text-secondary);">PDF Downloads:</span> <strong>${p.pdf_downloads}</strong></p>
                        <p style="padding: 6px 0; border-bottom: 1px solid var(--border);"><span style="color: var(--text-secondary);">Shares:</span> <strong>${p.shares}</strong></p>
                        <p style="padding: 6px 0;"><span style="color: var(--text-secondary);">First Seen:</span> <strong>${p.first_seen ? new Date(p.first_seen).toLocaleDateString() : '-'}</strong></p>
                    </div>
                    <div>
                        <h4 style="margin-bottom: 10px; font-size: 13px;">Top Referrers</h4>
                        ${Object.keys(p.referrers).length > 0 ? Object.entries(p.referrers).slice(0, 4).map(([ref, cnt]) =>
                            `<p style="padding: 6px 0; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between;"><span style="color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; max-width: 150px;">${ref}</span> <strong>${cnt}</strong></p>`
                        ).join('') : '<p style="color: var(--text-secondary);">No data</p>'}
                    </div>
                </div>
            `;
            const dailyStats = p.daily_stats;
            const dates = Object.keys(dailyStats);
            if (propertyDetailChart) propertyDetailChart.destroy();
            const ctx = document.getElementById('propertyDetailChart').getContext('2d');
            propertyDetailChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: dates.map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                    datasets: [
                        { label: 'Views', data: dates.map(d => dailyStats[d].views), borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', fill: true, tension: 0.3 },
                        { label: 'Clicks', data: dates.map(d => dailyStats[d].clicks), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.3 }
                    ]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true } } }
            });
        }

        function closePropertyModal() { document.getElementById('property-modal').style.display = 'none'; }
        document.getElementById('property-modal').addEventListener('click', function(e) { if (e.target === this) closePropertyModal(); });

        loadDashboard();
        loadPropertyRankings();
        setInterval(loadDashboard, 60000);
    </script>
</body>
</html>
