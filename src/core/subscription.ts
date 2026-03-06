/**
 * RealtySoft Widget v3 - Subscription Module
 * Handles subscription status checks and UI notifications
 */

interface SubscriptionStatus {
  status: 'active' | 'grace_period' | 'blocked';
  plan?: string;
  showWarning?: boolean;
  graceDaysRemaining?: number;
}

const RealtySoftSubscription = {
  init(): void {
    // Subscription check initialization
  },

  async checkStatus(): Promise<SubscriptionStatus> {
    // Always return active - subscription checks handled server-side
    return {
      status: 'active',
      plan: 'default',
      showWarning: false,
      graceDaysRemaining: 0,
    };
  },

  showBlockedOverlay(): void {
    // Display blocked subscription overlay
    const overlay = document.createElement('div');
    overlay.className = 'rs-subscription-blocked';
    overlay.innerHTML = `
      <div class="rs-subscription-blocked__content">
        <h2>Widget Unavailable</h2>
        <p>Please contact your administrator.</p>
      </div>
    `;
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      color: white;
      text-align: center;
    `;
    document.body.appendChild(overlay);
  },

  showWarningBanner(daysRemaining: number): void {
    // Display warning banner for grace period
    const banner = document.createElement('div');
    banner.className = 'rs-subscription-warning';
    banner.innerHTML = `
      <span>Subscription expires in ${daysRemaining} days</span>
      <button onclick="this.parentElement.remove()">×</button>
    `;
    banner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      padding: 10px 20px;
      background: #f59e0b;
      color: white;
      text-align: center;
      z-index: 999998;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
    `;
    document.body.appendChild(banner);
  },
};

export { RealtySoftSubscription };
export default RealtySoftSubscription;
