<?php
/**
 * RealtySoft Widget v2 - Analytics Dashboard Index
 * Routes to admin or client dashboards
 */

// If client parameter is provided, redirect to client dashboard
if (isset($_GET['client']) && !empty($_GET['client'])) {
    header('Location: client.php?client=' . urlencode($_GET['client']));
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RealtySoft Analytics</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        .container {
            text-align: center;
            max-width: 600px;
        }
        h1 {
            color: white;
            font-size: 48px;
            margin-bottom: 10px;
        }
        .subtitle {
            color: rgba(255,255,255,0.7);
            font-size: 18px;
            margin-bottom: 50px;
        }
        .cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }
        .card {
            background: white;
            padding: 40px 30px;
            border-radius: 16px;
            text-decoration: none;
            transition: all 0.3s;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        }
        .card-icon {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            border-radius: 16px;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0 auto 20px;
        }
        .card-icon svg {
            width: 30px;
            height: 30px;
            color: white;
        }
        .card h2 {
            color: #1f2937;
            font-size: 22px;
            margin-bottom: 10px;
        }
        .card p {
            color: #6b7280;
            font-size: 14px;
            line-height: 1.5;
        }
        .card.admin .card-icon {
            background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
        }
        .footer {
            margin-top: 50px;
            color: rgba(255,255,255,0.5);
            font-size: 13px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Analytics</h1>
        <p class="subtitle">RealtySoft Widget v2 Analytics Dashboard</p>

        <div class="cards">
            <a href="admin.php" class="card admin">
                <div class="card-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                </div>
                <h2>Admin Dashboard</h2>
                <p>Master view of all clients. View aggregate analytics, compare performance, and manage data.</p>
            </a>

            <a href="#" class="card" onclick="promptClient(); return false;">
                <div class="card-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                </div>
                <h2>Client Dashboard</h2>
                <p>View analytics for a specific client. Requires client domain and login credentials.</p>
            </a>
        </div>

        <div class="footer">
            RealtySoft Widget v2 &copy; <?php echo date('Y'); ?>
        </div>
    </div>

    <script>
        function promptClient() {
            const domain = prompt('Enter client domain (e.g., example.com):');
            if (domain && domain.trim()) {
                window.location.href = 'client.php?client=' + encodeURIComponent(domain.trim());
            }
        }
    </script>
</body>
</html>
