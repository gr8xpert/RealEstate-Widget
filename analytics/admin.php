<?php
/**
 * RealtySoft Widget v2 - Admin Analytics Dashboard
 * Master view for all clients with charts and data visualization
 */

// Simple admin authentication (you can enhance this)
$adminPassword = 'Aj$xChamp2025$'; // Change this in production
session_start();

// Handle logout
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: admin.php');
    exit;
}

// Handle login
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['password'])) {
    if ($_POST['password'] === $adminPassword) {
        $_SESSION['admin_auth'] = true;
        header('Location: admin.php');
        exit;
    }
    $error = 'Invalid password';
}

// Check authentication
if (!isset($_SESSION['admin_auth']) || $_SESSION['admin_auth'] !== true) {
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Login - RealtySoft Analytics</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); display: flex; justify-content: center; align-items: center; min-height: 100vh; }
            .login-box { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); width: 100%; max-width: 400px; }
            h2 { color: #1a1a2e; text-align: center; margin-bottom: 30px; }
            .error { background: #fee; color: #c33; padding: 12px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; }
            input { width: 100%; padding: 14px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 16px; margin-bottom: 20px; }
            input:focus { outline: none; border-color: #6366f1; }
            button { width: 100%; padding: 14px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; }
            button:hover { opacity: 0.9; }
        </style>
    </head>
    <body>
        <div class="login-box">
            <h2>Admin Dashboard</h2>
            <?php if (isset($error)): ?>
                <div class="error"><?php echo htmlspecialchars($error); ?></div>
            <?php endif; ?>
            <form method="POST">
                <input type="password" name="password" placeholder="Enter admin password" required autofocus>
                <button type="submit">Login</button>
            </form>
        </div>
    </body>
    </html>
    <?php
    exit;
}

// Admin is authenticated - show dashboard
$apiBase = '../php/analytics-api.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Analytics Dashboard - RealtySoft</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
            --primary: #6366f1;
            --primary-dark: #4f46e5;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --bg-dark: #1a1a2e;
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

        /* Header */
        .header {
            background: linear-gradient(135deg, var(--bg-dark) 0%, #16213e 100%);
            color: white;
            padding: 20px 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
        }

        .header h1 { font-size: 24px; font-weight: 600; }
        .header p { opacity: 0.8; font-size: 14px; margin-top: 4px; }

        .header-actions { display: flex; gap: 10px; align-items: center; }

        .btn {
            padding: 10px 20px;
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

        .btn-primary { background: var(--primary); color: white; }
        .btn-primary:hover { background: var(--primary-dark); }
        .btn-secondary { background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); }
        .btn-secondary:hover { background: rgba(255,255,255,0.2); }
        .btn-danger { background: var(--danger); color: white; }
        .btn-success { background: var(--success); color: white; }

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

        /* Main Container */
        .container { padding: 30px; max-width: 1600px; margin: 0 auto; }

        /* Filters */
        .filters {
            background: var(--bg-card);
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            margin-bottom: 30px;
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
            align-items: center;
        }

        .filter-group { display: flex; flex-direction: column; gap: 4px; }
        .filter-group label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; }

        .filter-group select,
        .filter-group input {
            padding: 10px 14px;
            border: 2px solid var(--border);
            border-radius: 8px;
            font-size: 14px;
            min-width: 150px;
        }

        .filter-group select:focus,
        .filter-group input:focus {
            outline: none;
            border-color: var(--primary);
        }

        /* Stats Grid */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .stat-card {
            background: var(--bg-card);
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            position: relative;
            overflow: hidden;
        }

        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
        }

        .stat-card.searches::before { background: var(--primary); }
        .stat-card.views::before { background: var(--success); }
        .stat-card.clicks::before { background: var(--warning); }
        .stat-card.wishlist::before { background: #ec4899; }
        .stat-card.inquiries::before { background: var(--danger); }
        .stat-card.sessions::before { background: #8b5cf6; }

        .stat-label {
            font-size: 13px;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }

        .stat-value {
            font-size: 32px;
            font-weight: 700;
            color: var(--text-primary);
        }

        .stat-change {
            font-size: 12px;
            margin-top: 8px;
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .stat-change.positive { color: var(--success); }
        .stat-change.negative { color: var(--danger); }

        /* Charts Grid */
        .charts-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }

        @media (max-width: 1024px) {
            .charts-grid { grid-template-columns: 1fr; }
        }

        .chart-card {
            background: var(--bg-card);
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .chart-card h3 {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 20px;
            color: var(--text-primary);
        }

        .chart-container { position: relative; height: 300px; }

        /* Tables */
        .table-card {
            background: var(--bg-card);
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            overflow: hidden;
            margin-bottom: 30px;
        }

        .table-header {
            padding: 20px 24px;
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
        }

        .table-header h3 { font-size: 16px; font-weight: 600; }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        thead { background: #f9fafb; }

        th {
            text-align: left;
            padding: 12px 24px;
            font-size: 12px;
            font-weight: 600;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        td {
            padding: 16px 24px;
            border-top: 1px solid var(--border);
            font-size: 14px;
        }

        tr:hover { background: #f9fafb; }

        .property-ref {
            font-weight: 600;
            color: var(--primary);
        }

        .client-badge {
            display: inline-block;
            padding: 4px 10px;
            background: linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%);
            color: white;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
        }

        .metric { font-weight: 600; font-size: 16px; }

        /* Loading & Empty States */
        .loading, .no-data {
            text-align: center;
            padding: 60px 20px;
            color: var(--text-secondary);
        }

        .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid var(--border);
            border-top-color: var(--primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 15px;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 768px) {
            .header { padding: 15px; }
            .container { padding: 15px; }
            .filters { flex-direction: column; }
            .filter-group { width: 100%; }
            .filter-group select,
            .filter-group input { width: 100%; }
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
        .tab-btn.active {
            background: var(--primary);
            border-color: var(--primary);
            color: white;
        }

        /* Rankings Grid */
        .rankings-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
        }
        .ranking-card {
            background: var(--bg-card);
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .ranking-card h4 {
            padding: 16px 20px;
            background: #f9fafb;
            border-bottom: 1px solid var(--border);
            font-size: 14px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .rank-icon { font-size: 18px; }
        .ranking-list { padding: 0; }
        .ranking-item {
            display: flex;
            align-items: center;
            padding: 12px 20px;
            border-bottom: 1px solid var(--border);
            gap: 12px;
        }
        .ranking-item:last-child { border-bottom: none; }
        .ranking-item:hover { background: #f9fafb; }
        .rank-number {
            width: 24px;
            height: 24px;
            background: var(--primary);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 700;
            flex-shrink: 0;
        }
        .rank-number.gold { background: linear-gradient(135deg, #f59e0b, #d97706); }
        .rank-number.silver { background: linear-gradient(135deg, #9ca3af, #6b7280); }
        .rank-number.bronze { background: linear-gradient(135deg, #d97706, #b45309); }
        .ranking-info { flex: 1; min-width: 0; }
        .ranking-ref {
            font-weight: 600;
            color: var(--primary);
            font-size: 13px;
            cursor: pointer;
        }
        .ranking-ref:hover { text-decoration: underline; }
        .ranking-location {
            font-size: 11px;
            color: var(--text-secondary);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .ranking-value {
            font-weight: 700;
            font-size: 16px;
            color: var(--text-primary);
        }

        /* Funnel Visualization */
        .funnel-visual { padding: 20px; }
        .funnel-step {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
        }
        .funnel-label {
            width: 140px;
            font-size: 13px;
            font-weight: 500;
            color: var(--text-secondary);
        }
        .funnel-bar-container {
            flex: 1;
            background: #f3f4f6;
            border-radius: 8px;
            height: 36px;
            overflow: hidden;
            position: relative;
        }
        .funnel-bar {
            height: 100%;
            background: linear-gradient(90deg, var(--primary), #8b5cf6);
            border-radius: 8px;
            transition: width 0.5s ease;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding-right: 12px;
        }
        .funnel-value {
            color: white;
            font-weight: 700;
            font-size: 13px;
            text-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }
        .funnel-percent {
            width: 60px;
            text-align: right;
            font-weight: 600;
            font-size: 13px;
            color: var(--text-primary);
            margin-left: 12px;
        }

        /* Conversion Cards */
        .conversion-cards { padding: 20px; }
        .conversion-card {
            background: #f9fafb;
            padding: 16px;
            border-radius: 10px;
            margin-bottom: 12px;
        }
        .conversion-card:last-child { margin-bottom: 0; }
        .conversion-label {
            font-size: 12px;
            color: var(--text-secondary);
            margin-bottom: 6px;
        }
        .conversion-value {
            font-size: 24px;
            font-weight: 700;
            color: var(--primary);
        }
        .conversion-value.highlight {
            color: var(--success);
            font-size: 28px;
        }

        /* Modal */
        .modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
        }
        .modal-content {
            background: white;
            border-radius: 16px;
            max-width: 900px;
            width: 100%;
            max-height: 90vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        .modal-header {
            padding: 20px 24px;
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .modal-header h3 { font-size: 18px; }
        .modal-close {
            width: 32px;
            height: 32px;
            border: none;
            background: #f3f4f6;
            border-radius: 8px;
            cursor: pointer;
            font-size: 20px;
            color: var(--text-secondary);
        }
        .modal-close:hover { background: #e5e7eb; }
        .modal-body {
            padding: 24px;
            overflow-y: auto;
        }
        .modal-stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
        }
        .modal-stat {
            text-align: center;
            padding: 16px;
            background: #f9fafb;
            border-radius: 10px;
        }
        .modal-stat-value {
            font-size: 28px;
            font-weight: 700;
            color: var(--primary);
        }
        .modal-stat-label {
            font-size: 11px;
            color: var(--text-secondary);
            text-transform: uppercase;
            margin-top: 4px;
        }
        .modal-chart-container { height: 200px; margin-bottom: 24px; }

        /* Pagination */
        .pagination {
            display: flex;
            gap: 5px;
            align-items: center;
        }
        .pagination button {
            padding: 8px 12px;
            border: 1px solid var(--border);
            background: white;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
        }
        .pagination button:hover { background: #f3f4f6; }
        .pagination button.active {
            background: var(--primary);
            color: white;
            border-color: var(--primary);
        }
        .pagination button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <h1>Analytics Dashboard</h1>
            <p>Master view - All clients</p>
        </div>
        <div class="header-actions">
            <div class="export-dropdown">
                <button class="btn btn-secondary" onclick="toggleExportMenu()">Export CSV &#9662;</button>
                <div class="export-menu" id="exportMenu">
                    <a href="#" onclick="exportCSV('export'); return false;">Raw Events</a>
                    <a href="#" onclick="exportCSV('export_properties'); return false;">Property Performance</a>
                    <a href="#" onclick="exportCSV('export_trends'); return false;">Daily Trends</a>
                    <a href="#" onclick="exportCSV('export_searches'); return false;">Search Insights</a>
                    <a href="#" onclick="exportCSV('export_funnel'); return false;">Conversion Funnel</a>
                </div>
            </div>
            <button class="btn btn-primary" onclick="loadDashboard()">Refresh</button>
            <a href="?logout=1" class="btn btn-danger">Logout</a>
        </div>
    </div>

    <div class="container">
        <!-- Filters -->
        <div class="filters">
            <div class="filter-group">
                <label>Period</label>
                <select id="filter-period" onchange="loadDashboard()">
                    <option value="today">Today</option>
                    <option value="week" selected>Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                    <option value="quarter">Last 90 Days</option>
                    <option value="year">Last Year</option>
                    <option value="all">All Time</option>
                    <option value="custom">Custom Range</option>
                </select>
            </div>

            <div class="filter-group" id="custom-date-from" style="display: none;">
                <label>From</label>
                <input type="date" id="filter-date-from" onchange="loadDashboard()">
            </div>

            <div class="filter-group" id="custom-date-to" style="display: none;">
                <label>To</label>
                <input type="date" id="filter-date-to" onchange="loadDashboard()">
            </div>

            <div class="filter-group">
                <label>Client</label>
                <select id="filter-client" onchange="loadDashboard()">
                    <option value="">All Clients</option>
                </select>
            </div>
        </div>

        <!-- Stats Grid -->
        <div class="stats-grid">
            <div class="stat-card searches">
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
            <div class="stat-card sessions">
                <div class="stat-label">Unique Sessions</div>
                <div class="stat-value" id="stat-sessions">-</div>
            </div>
        </div>

        <!-- Charts -->
        <div class="charts-grid">
            <div class="chart-card">
                <h3>Activity Trends</h3>
                <div class="chart-container">
                    <canvas id="trendsChart"></canvas>
                </div>
            </div>
            <div class="chart-card">
                <h3>Event Distribution</h3>
                <div class="chart-container">
                    <canvas id="distributionChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Top Properties Table -->
        <div class="table-card">
            <div class="table-header">
                <h3>Top Properties</h3>
                <div class="filter-group" style="flex-direction: row; align-items: center; gap: 10px;">
                    <label style="margin: 0;">Sort by:</label>
                    <select id="filter-sort" onchange="loadProperties()" style="min-width: 120px;">
                        <option value="all">All Events</option>
                        <option value="property_view">Views</option>
                        <option value="card_click">Clicks</option>
                        <option value="add">Wishlist</option>
                        <option value="submit">Inquiries</option>
                    </select>
                </div>
            </div>

            <div id="properties-loading" class="loading">
                <div class="spinner"></div>
                <p>Loading properties...</p>
            </div>

            <table id="properties-table" style="display: none;">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Property Ref</th>
                        <th>Client</th>
                        <th>Location</th>
                        <th>Views</th>
                        <th>Clicks</th>
                        <th>Wishlist</th>
                        <th>Inquiries</th>
                        <th>Users</th>
                        <th>Last Activity</th>
                    </tr>
                </thead>
                <tbody id="properties-tbody"></tbody>
            </table>

            <div id="properties-empty" class="no-data" style="display: none;">
                <p>No property data available for the selected filters.</p>
            </div>
        </div>

        <!-- Search Insights -->
        <div class="charts-grid">
            <div class="chart-card">
                <h3>Top Searched Locations</h3>
                <div class="chart-container">
                    <canvas id="locationsChart"></canvas>
                </div>
            </div>
            <div class="chart-card">
                <h3>Property Types</h3>
                <div class="chart-container">
                    <canvas id="typesChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Property Analytics Section -->
        <div class="section-header" style="margin: 40px 0 20px; display: flex; justify-content: space-between; align-items: center;">
            <h2 style="font-size: 20px; color: var(--text-primary);">Property Analytics</h2>
            <div class="tabs" style="display: flex; gap: 10px;">
                <button class="tab-btn active" data-tab="rankings" onclick="switchPropertyTab('rankings')">Rankings</button>
                <button class="tab-btn" data-tab="table" onclick="switchPropertyTab('table')">All Properties</button>
                <button class="tab-btn" data-tab="funnel" onclick="switchPropertyTab('funnel')">Funnel Analysis</button>
            </div>
        </div>

        <!-- Property Rankings Tab -->
        <div id="tab-rankings" class="property-tab">
            <div class="rankings-grid">
                <div class="ranking-card">
                    <h4><span class="rank-icon">👁️</span> Most Viewed</h4>
                    <div id="ranking-views" class="ranking-list">
                        <div class="loading"><div class="spinner"></div></div>
                    </div>
                </div>
                <div class="ranking-card">
                    <h4><span class="rank-icon">❤️</span> Most Wishlisted</h4>
                    <div id="ranking-wishlist" class="ranking-list">
                        <div class="loading"><div class="spinner"></div></div>
                    </div>
                </div>
                <div class="ranking-card">
                    <h4><span class="rank-icon">📧</span> Most Inquired</h4>
                    <div id="ranking-inquiries" class="ranking-list">
                        <div class="loading"><div class="spinner"></div></div>
                    </div>
                </div>
                <div class="ranking-card">
                    <h4><span class="rank-icon">🔥</span> Top Engagement</h4>
                    <div id="ranking-engagement" class="ranking-list">
                        <div class="loading"><div class="spinner"></div></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Property Table Tab -->
        <div id="tab-table" class="property-tab" style="display: none;">
            <div class="table-card">
                <div class="table-header">
                    <div style="display: flex; gap: 15px; align-items: center;">
                        <input type="text" id="property-search" placeholder="Search properties..."
                               style="padding: 10px 14px; border: 2px solid var(--border); border-radius: 8px; min-width: 250px;"
                               onkeyup="debouncePropertySearch()">
                        <select id="property-sort" onchange="loadPropertyTable()" style="padding: 10px 14px; border: 2px solid var(--border); border-radius: 8px;">
                            <option value="views">Sort by Views</option>
                            <option value="clicks">Sort by Clicks</option>
                            <option value="wishlist_adds">Sort by Wishlist</option>
                            <option value="inquiries">Sort by Inquiries</option>
                            <option value="conversion_rate">Sort by Conversion</option>
                            <option value="last_activity">Sort by Recent</option>
                        </select>
                    </div>
                    <div id="property-table-pagination" class="pagination"></div>
                </div>

                <table id="property-detail-table">
                    <thead>
                        <tr>
                            <th>Property Ref</th>
                            <th>Location</th>
                            <th>Type</th>
                            <th>Price</th>
                            <th>Views</th>
                            <th>Clicks</th>
                            <th>Wishlist</th>
                            <th>Inquiries</th>
                            <th>Conv. Rate</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="property-detail-tbody"></tbody>
                </table>
            </div>
        </div>

        <!-- Funnel Analysis Tab -->
        <div id="tab-funnel" class="property-tab" style="display: none;">
            <div class="charts-grid">
                <div class="chart-card" style="flex: 2;">
                    <h3>Conversion Funnel</h3>
                    <div id="funnel-container" class="funnel-visual">
                        <div class="loading"><div class="spinner"></div></div>
                    </div>
                </div>
                <div class="chart-card">
                    <h3>Conversion Rates</h3>
                    <div id="conversion-stats" class="conversion-cards">
                        <div class="loading"><div class="spinner"></div></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Property Detail Modal -->
        <div id="property-modal" class="modal" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Property Details: <span id="modal-property-ref"></span></h3>
                    <button class="modal-close" onclick="closePropertyModal()">&times;</button>
                </div>
                <div class="modal-body" id="modal-body">
                    <div class="loading"><div class="spinner"></div></div>
                </div>
            </div>
        </div>
    </div>

    <script>
        const API_BASE = '<?php echo $apiBase; ?>';
        let trendsChart, distributionChart, locationsChart, typesChart;

        // Show/hide custom date inputs
        document.getElementById('filter-period').addEventListener('change', function() {
            const isCustom = this.value === 'custom';
            document.getElementById('custom-date-from').style.display = isCustom ? 'flex' : 'none';
            document.getElementById('custom-date-to').style.display = isCustom ? 'flex' : 'none';

            if (!isCustom) loadDashboard();
        });

        // Build query string from filters
        function getFilterParams() {
            const period = document.getElementById('filter-period').value;
            const client = document.getElementById('filter-client').value;
            const dateFrom = document.getElementById('filter-date-from').value;
            const dateTo = document.getElementById('filter-date-to').value;

            let params = new URLSearchParams();

            if (period === 'custom' && dateFrom && dateTo) {
                params.set('date_from', dateFrom);
                params.set('date_to', dateTo);
            } else {
                params.set('period', period);
            }

            if (client) params.set('client_id', client);

            return params.toString();
        }

        // Load all dashboard data
        async function loadDashboard() {
            await Promise.all([
                loadSummary(),
                loadTrends(),
                loadProperties(),
                loadSearchInsights()
            ]);
        }

        // Load summary stats
        async function loadSummary() {
            try {
                const response = await fetch(`${API_BASE}?action=summary&${getFilterParams()}`);
                const data = await response.json();

                if (data.success) {
                    document.getElementById('stat-searches').textContent = data.stats.searches.toLocaleString();
                    document.getElementById('stat-views').textContent = data.stats.property_views.toLocaleString();
                    document.getElementById('stat-clicks').textContent = data.stats.card_clicks.toLocaleString();
                    document.getElementById('stat-wishlist').textContent = data.stats.wishlist_adds.toLocaleString();
                    document.getElementById('stat-inquiries').textContent = data.stats.inquiries.toLocaleString();
                    document.getElementById('stat-sessions').textContent = data.unique_sessions.toLocaleString();

                    // Update client dropdown
                    const clientSelect = document.getElementById('filter-client');
                    const currentClient = clientSelect.value;
                    clientSelect.innerHTML = '<option value="">All Clients</option>';
                    (data.clients || []).forEach(client => {
                        const option = document.createElement('option');
                        option.value = client;
                        option.textContent = client;
                        if (client === currentClient) option.selected = true;
                        clientSelect.appendChild(option);
                    });

                    // Update distribution chart
                    updateDistributionChart(data.stats);
                }
            } catch (error) {
                console.error('Error loading summary:', error);
            }
        }

        // Load trends data
        async function loadTrends() {
            try {
                const response = await fetch(`${API_BASE}?action=trends&${getFilterParams()}`);
                const data = await response.json();

                if (data.success) {
                    updateTrendsChart(data.labels, data.datasets);
                }
            } catch (error) {
                console.error('Error loading trends:', error);
            }
        }

        // Load properties table
        async function loadProperties() {
            const loading = document.getElementById('properties-loading');
            const table = document.getElementById('properties-table');
            const empty = document.getElementById('properties-empty');
            const tbody = document.getElementById('properties-tbody');
            const eventType = document.getElementById('filter-sort').value;

            loading.style.display = 'block';
            table.style.display = 'none';
            empty.style.display = 'none';

            try {
                const response = await fetch(`${API_BASE}?action=properties&event_type=${eventType}&${getFilterParams()}`);
                const data = await response.json();

                loading.style.display = 'none';

                if (!data.success || data.properties.length === 0) {
                    empty.style.display = 'block';
                    return;
                }

                tbody.innerHTML = data.properties.slice(0, 50).map((prop, index) => `
                    <tr>
                        <td><strong>#${index + 1}</strong></td>
                        <td class="property-ref">${prop.property_ref || prop.property_id || '-'}</td>
                        <td><span class="client-badge">${prop.client_id || '-'}</span></td>
                        <td>${prop.location || '-'}</td>
                        <td class="metric">${prop.views || 0}</td>
                        <td class="metric">${prop.clicks || 0}</td>
                        <td class="metric">${prop.wishlist_adds || 0}</td>
                        <td class="metric">${prop.inquiries || 0}</td>
                        <td>${prop.unique_users || 0}</td>
                        <td>${prop.last_activity ? new Date(prop.last_activity).toLocaleString() : '-'}</td>
                    </tr>
                `).join('');

                table.style.display = 'table';
            } catch (error) {
                console.error('Error loading properties:', error);
                loading.style.display = 'none';
                empty.style.display = 'block';
            }
        }

        // Load search insights
        async function loadSearchInsights() {
            try {
                const response = await fetch(`${API_BASE}?action=searches&${getFilterParams()}`);
                const data = await response.json();

                if (data.success) {
                    updateLocationsChart(data.top_locations);
                    updateTypesChart(data.top_property_types);
                }
            } catch (error) {
                console.error('Error loading search insights:', error);
            }
        }

        // Update trends chart
        function updateTrendsChart(labels, datasets) {
            const ctx = document.getElementById('trendsChart').getContext('2d');

            if (trendsChart) trendsChart.destroy();

            trendsChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Property Views',
                            data: datasets.property_views,
                            borderColor: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            tension: 0.3,
                            fill: true
                        },
                        {
                            label: 'Searches',
                            data: datasets.searches,
                            borderColor: '#6366f1',
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            tension: 0.3,
                            fill: true
                        },
                        {
                            label: 'Inquiries',
                            data: datasets.inquiries,
                            borderColor: '#ef4444',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            tension: 0.3,
                            fill: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom' }
                    },
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        }

        // Update distribution chart
        function updateDistributionChart(stats) {
            const ctx = document.getElementById('distributionChart').getContext('2d');

            if (distributionChart) distributionChart.destroy();

            distributionChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Searches', 'Views', 'Clicks', 'Wishlist', 'Inquiries'],
                    datasets: [{
                        data: [
                            stats.searches,
                            stats.property_views,
                            stats.card_clicks,
                            stats.wishlist_adds,
                            stats.inquiries
                        ],
                        backgroundColor: [
                            '#6366f1',
                            '#10b981',
                            '#f59e0b',
                            '#ec4899',
                            '#ef4444'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });
        }

        // Update locations chart
        function updateLocationsChart(data) {
            const ctx = document.getElementById('locationsChart').getContext('2d');

            if (locationsChart) locationsChart.destroy();

            const labels = Object.keys(data).slice(0, 10);
            const values = Object.values(data).slice(0, 10);

            locationsChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Searches',
                        data: values,
                        backgroundColor: '#6366f1'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        }

        // Update property types chart
        function updateTypesChart(data) {
            const ctx = document.getElementById('typesChart').getContext('2d');

            if (typesChart) typesChart.destroy();

            const labels = Object.keys(data).slice(0, 8);
            const values = Object.values(data).slice(0, 8);

            typesChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        data: values,
                        backgroundColor: [
                            '#6366f1', '#10b981', '#f59e0b', '#ef4444',
                            '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });
        }

        // Export CSV
        function exportCSV(type) {
            const params = getFilterParams();
            window.location.href = `${API_BASE}?action=${type}&${params}`;
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

        // ===== Property Analytics Functions =====

        let propertyTablePage = 1;
        let propertySearchTimeout = null;
        let propertyDetailChart = null;

        // Switch between property analytics tabs
        function switchPropertyTab(tab) {
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.tab === tab);
            });
            document.querySelectorAll('.property-tab').forEach(el => {
                el.style.display = el.id === `tab-${tab}` ? 'block' : 'none';
            });

            if (tab === 'rankings') loadPropertyRankings();
            if (tab === 'table') loadPropertyTable();
            if (tab === 'funnel') loadFunnelAnalysis();
        }

        // Load property rankings
        async function loadPropertyRankings() {
            const params = getFilterParams();

            try {
                const response = await fetch(`${API_BASE}?action=property_rankings&${params}&limit=10`);
                const data = await response.json();

                if (data.success) {
                    renderRankingList('ranking-views', data.rankings.top_viewed, 'views');
                    renderRankingList('ranking-wishlist', data.rankings.top_wishlisted, 'wishlist_adds');
                    renderRankingList('ranking-inquiries', data.rankings.top_inquired, 'inquiries');
                    renderRankingList('ranking-engagement', data.rankings.top_engagement, 'total_engagement');
                }
            } catch (e) {
                console.error('Failed to load rankings:', e);
            }
        }

        // Render ranking list
        function renderRankingList(containerId, items, valueKey) {
            const container = document.getElementById(containerId);

            if (!items || items.length === 0) {
                container.innerHTML = '<div class="no-data" style="padding: 20px;">No data available</div>';
                return;
            }

            container.innerHTML = items.slice(0, 10).map((item, index) => {
                const rankClass = index === 0 ? 'gold' : (index === 1 ? 'silver' : (index === 2 ? 'bronze' : ''));
                return `
                    <div class="ranking-item">
                        <div class="rank-number ${rankClass}">${index + 1}</div>
                        <div class="ranking-info">
                            <div class="ranking-ref" onclick="showPropertyDetail('${item.property_ref}')">${item.property_ref}</div>
                            <div class="ranking-location">${item.location || 'Unknown location'}</div>
                        </div>
                        <div class="ranking-value">${item[valueKey].toLocaleString()}</div>
                    </div>
                `;
            }).join('');
        }

        // Load property table with pagination
        async function loadPropertyTable() {
            const params = getFilterParams();
            const sort = document.getElementById('property-sort').value;
            const search = document.getElementById('property-search').value;

            try {
                const response = await fetch(`${API_BASE}?action=property_table&${params}&sort=${sort}&order=desc&page=${propertyTablePage}&per_page=15&search=${encodeURIComponent(search)}`);
                const data = await response.json();

                if (data.success) {
                    renderPropertyTable(data.properties);
                    renderPagination(data.pagination);
                }
            } catch (e) {
                console.error('Failed to load property table:', e);
            }
        }

        // Render property table
        function renderPropertyTable(properties) {
            const tbody = document.getElementById('property-detail-tbody');

            if (!properties || properties.length === 0) {
                tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 40px;">No properties found</td></tr>';
                return;
            }

            tbody.innerHTML = properties.map(p => `
                <tr>
                    <td><span class="property-ref" style="cursor: pointer;" onclick="showPropertyDetail('${p.property_ref}')">${p.property_ref}</span></td>
                    <td>${p.location || '-'}</td>
                    <td>${p.property_type || '-'}</td>
                    <td>${p.price ? '€' + parseInt(p.price).toLocaleString() : '-'}</td>
                    <td class="metric">${p.views}</td>
                    <td class="metric">${p.clicks}</td>
                    <td class="metric">${p.wishlist_adds}</td>
                    <td class="metric">${p.inquiries}</td>
                    <td><span style="color: ${p.conversion_rate > 5 ? 'var(--success)' : 'var(--text-secondary)'}">${p.conversion_rate}%</span></td>
                    <td><button class="btn btn-primary" style="padding: 6px 12px; font-size: 12px;" onclick="showPropertyDetail('${p.property_ref}')">Details</button></td>
                </tr>
            `).join('');
        }

        // Render pagination
        function renderPagination(pagination) {
            const container = document.getElementById('property-table-pagination');
            const { page, total_pages } = pagination;

            if (total_pages <= 1) {
                container.innerHTML = '';
                return;
            }

            let html = `<button onclick="goToPage(${page - 1})" ${page === 1 ? 'disabled' : ''}>&lt;</button>`;

            for (let i = 1; i <= total_pages; i++) {
                if (i === 1 || i === total_pages || (i >= page - 2 && i <= page + 2)) {
                    html += `<button onclick="goToPage(${i})" class="${i === page ? 'active' : ''}">${i}</button>`;
                } else if (i === page - 3 || i === page + 3) {
                    html += '<span style="padding: 0 8px;">...</span>';
                }
            }

            html += `<button onclick="goToPage(${page + 1})" ${page === total_pages ? 'disabled' : ''}>&gt;</button>`;

            container.innerHTML = html;
        }

        function goToPage(page) {
            propertyTablePage = page;
            loadPropertyTable();
        }

        // Debounce property search
        function debouncePropertySearch() {
            clearTimeout(propertySearchTimeout);
            propertySearchTimeout = setTimeout(() => {
                propertyTablePage = 1;
                loadPropertyTable();
            }, 300);
        }

        // Load funnel analysis
        async function loadFunnelAnalysis() {
            const params = getFilterParams();

            try {
                const response = await fetch(`${API_BASE}?action=property_funnel&${params}`);
                const data = await response.json();

                if (data.success) {
                    renderFunnel(data.funnel);
                    renderConversions(data.conversions);
                }
            } catch (e) {
                console.error('Failed to load funnel:', e);
            }
        }

        // Render funnel visualization
        function renderFunnel(funnel) {
            const container = document.getElementById('funnel-container');
            const maxCount = funnel.total_sessions.count;

            const steps = [
                { key: 'total_sessions', label: 'Total Sessions' },
                { key: 'searched', label: 'Searched' },
                { key: 'clicked_property', label: 'Clicked Property' },
                { key: 'viewed_detail', label: 'Viewed Details' },
                { key: 'added_wishlist', label: 'Added to Wishlist' },
                { key: 'inquired', label: 'Made Inquiry' }
            ];

            container.innerHTML = steps.map(step => {
                const data = funnel[step.key];
                const width = maxCount > 0 ? (data.count / maxCount) * 100 : 0;

                return `
                    <div class="funnel-step">
                        <div class="funnel-label">${step.label}</div>
                        <div class="funnel-bar-container">
                            <div class="funnel-bar" style="width: ${Math.max(width, 5)}%;">
                                <span class="funnel-value">${data.count.toLocaleString()}</span>
                            </div>
                        </div>
                        <div class="funnel-percent">${data.percentage}%</div>
                    </div>
                `;
            }).join('');
        }

        // Render conversion rates
        function renderConversions(conversions) {
            const container = document.getElementById('conversion-stats');

            container.innerHTML = `
                <div class="conversion-card">
                    <div class="conversion-label">Search → Click</div>
                    <div class="conversion-value">${conversions.search_to_click}%</div>
                </div>
                <div class="conversion-card">
                    <div class="conversion-label">Click → View Details</div>
                    <div class="conversion-value">${conversions.click_to_view}%</div>
                </div>
                <div class="conversion-card">
                    <div class="conversion-label">View → Wishlist</div>
                    <div class="conversion-value">${conversions.view_to_wishlist}%</div>
                </div>
                <div class="conversion-card">
                    <div class="conversion-label">View → Inquiry</div>
                    <div class="conversion-value">${conversions.view_to_inquiry}%</div>
                </div>
                <div class="conversion-card">
                    <div class="conversion-label">Overall Conversion</div>
                    <div class="conversion-value highlight">${conversions.overall_conversion}%</div>
                </div>
            `;
        }

        // Show property detail modal
        async function showPropertyDetail(propertyRef) {
            const modal = document.getElementById('property-modal');
            const modalBody = document.getElementById('modal-body');
            document.getElementById('modal-property-ref').textContent = propertyRef;

            modal.style.display = 'flex';
            modalBody.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading property data...</p></div>';

            const params = getFilterParams();

            try {
                const response = await fetch(`${API_BASE}?action=property_detail&${params}&property_ref=${encodeURIComponent(propertyRef)}`);
                const data = await response.json();

                if (data.success) {
                    renderPropertyModal(data.property);
                } else {
                    modalBody.innerHTML = '<div class="no-data">Failed to load property data</div>';
                }
            } catch (e) {
                modalBody.innerHTML = '<div class="no-data">Error loading property data</div>';
            }
        }

        // Render property modal content
        function renderPropertyModal(property) {
            const modalBody = document.getElementById('modal-body');

            modalBody.innerHTML = `
                <div class="modal-stats-grid">
                    <div class="modal-stat">
                        <div class="modal-stat-value">${property.views}</div>
                        <div class="modal-stat-label">Views</div>
                    </div>
                    <div class="modal-stat">
                        <div class="modal-stat-value">${property.clicks}</div>
                        <div class="modal-stat-label">Clicks</div>
                    </div>
                    <div class="modal-stat">
                        <div class="modal-stat-value">${property.wishlist_adds}</div>
                        <div class="modal-stat-label">Wishlist</div>
                    </div>
                    <div class="modal-stat">
                        <div class="modal-stat-value">${property.inquiries}</div>
                        <div class="modal-stat-label">Inquiries</div>
                    </div>
                    <div class="modal-stat">
                        <div class="modal-stat-value">${property.unique_users}</div>
                        <div class="modal-stat-label">Unique Users</div>
                    </div>
                    <div class="modal-stat">
                        <div class="modal-stat-value">${property.inquiry_rate}%</div>
                        <div class="modal-stat-label">Conv. Rate</div>
                    </div>
                </div>

                <h4 style="margin-bottom: 16px; font-size: 14px;">Activity Over Time</h4>
                <div class="modal-chart-container">
                    <canvas id="propertyDetailChart"></canvas>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <h4 style="margin-bottom: 12px; font-size: 14px;">Additional Stats</h4>
                        <table style="width: 100%; font-size: 13px;">
                            <tr><td style="padding: 8px 0; color: var(--text-secondary);">Gallery Views</td><td style="font-weight: 600;">${property.gallery_views}</td></tr>
                            <tr><td style="padding: 8px 0; color: var(--text-secondary);">PDF Downloads</td><td style="font-weight: 600;">${property.pdf_downloads}</td></tr>
                            <tr><td style="padding: 8px 0; color: var(--text-secondary);">Shares</td><td style="font-weight: 600;">${property.shares}</td></tr>
                            <tr><td style="padding: 8px 0; color: var(--text-secondary);">First Seen</td><td style="font-weight: 600;">${property.first_seen ? new Date(property.first_seen).toLocaleDateString() : '-'}</td></tr>
                            <tr><td style="padding: 8px 0; color: var(--text-secondary);">Last Seen</td><td style="font-weight: 600;">${property.last_seen ? new Date(property.last_seen).toLocaleDateString() : '-'}</td></tr>
                        </table>
                    </div>
                    <div>
                        <h4 style="margin-bottom: 12px; font-size: 14px;">Top Referrers</h4>
                        ${Object.keys(property.referrers).length > 0 ?
                            Object.entries(property.referrers).slice(0, 5).map(([ref, count]) => `
                                <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; border-bottom: 1px solid var(--border);">
                                    <span style="color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 200px;">${ref}</span>
                                    <span style="font-weight: 600;">${count}</span>
                                </div>
                            `).join('') : '<p style="color: var(--text-secondary); font-size: 13px;">No referrer data</p>'}
                    </div>
                </div>
            `;

            // Render chart
            const dailyStats = property.daily_stats;
            const dates = Object.keys(dailyStats);
            const views = dates.map(d => dailyStats[d].views);
            const clicks = dates.map(d => dailyStats[d].clicks);

            if (propertyDetailChart) propertyDetailChart.destroy();

            const ctx = document.getElementById('propertyDetailChart').getContext('2d');
            propertyDetailChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: dates.map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                    datasets: [
                        {
                            label: 'Views',
                            data: views,
                            borderColor: '#6366f1',
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            fill: true,
                            tension: 0.3
                        },
                        {
                            label: 'Clicks',
                            data: clicks,
                            borderColor: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            fill: true,
                            tension: 0.3
                        }
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

        // Close property modal
        function closePropertyModal() {
            document.getElementById('property-modal').style.display = 'none';
        }

        // Close modal on outside click
        document.getElementById('property-modal').addEventListener('click', function(e) {
            if (e.target === this) closePropertyModal();
        });

        // Initial load
        loadDashboard();
        loadPropertyRankings();

        // Auto-refresh every 60 seconds
        setInterval(loadDashboard, 60000);
    </script>
</body>
</html>
