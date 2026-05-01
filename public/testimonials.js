(function() {
    const script = document.currentScript;
    const businessSlug = script.getAttribute('data-business');
    if (!businessSlug) return;

    const API_URL = script.src.split('/testimonials.js')[0];
    const SUPABASE_URL = "https://your-project-id.supabase.co"; // This should be dynamic or injected
    const SUPABASE_KEY = "your-anon-key";

    async function init() {
        // Create container
        const container = document.createElement('div');
        container.id = 'feedback-pro-testimonials';
        script.parentNode.insertBefore(container, script);

        // Fetch Business ID first
        const bizRes = await fetch(`${SUPABASE_URL}/rest/v1/businesses?feedback_slug=eq.${businessSlug}&select=id,business_name`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        const biz = (await bizRes.json())[0];
        if (!biz) return;

        // Fetch Featured Feedback
        const fbRes = await fetch(`${SUPABASE_URL}/rest/v1/feedback?business_id=eq.${biz.id}&is_featured=eq.true&select=*&order=created_at.desc`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        const feedbacks = await fbRes.json();

        if (feedbacks.length === 0) return;

        // Inject Styles
        const style = document.createElement('style');
        style.textContent = `
            #feedback-pro-testimonials {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 20px;
                padding: 20px 0;
            }
            .fpt-card {
                background: white;
                border: 1px solid #eee;
                border-radius: 12px;
                padding: 20px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                transition: transform 0.2s;
            }
            .fpt-card:hover { transform: translateY(-5px); }
            .fpt-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
            .fpt-avatar { width: 40px; height: 40px; border-radius: 50%; background: #6366f1; color: white; display: grid; place-items: center; font-weight: bold; }
            .fpt-name { font-weight: 600; font-size: 14px; }
            .fpt-rating { color: #f59e0b; font-size: 14px; margin-bottom: 8px; }
            .fpt-msg { font-size: 14px; line-height: 1.5; color: #444; }
            .fpt-footer { margin-top: 15px; font-size: 10px; color: #999; display: flex; justify-content: space-between; align-items: center; }
            .fpt-badge { background: #f0fdf4; color: #16a34a; padding: 2px 8px; rounded-full; font-size: 10px; font-weight: bold; }
        `;
        document.head.appendChild(style);

        // Render
        container.innerHTML = feedbacks.map(f => `
            <div class="fpt-card">
                <div class="fpt-header">
                    <div class="fpt-avatar">${f.customer_name?.[0] || '?'}</div>
                    <div>
                        <div class="fpt-name">${f.customer_name || 'Anonymous'}</div>
                        <div class="fpt-rating">${'★'.repeat(f.rating || 0)}</div>
                    </div>
                </div>
                <p class="fpt-msg">"${f.message}"</p>
                <div class="fpt-footer">
                    <span>${new Date(f.created_at).toLocaleDateString()}</span>
                    <span class="fpt-badge">Verified Feedback</span>
                </div>
            </div>
        `).join('');
    }

    init();
})();
