/**
 * Injected HUD Overlay for displaying active agent thought steps in-page.
 */
export function renderAgentHUD(thought: string) {
  let hud = document.getElementById('visual-agent-hud');
  if (!hud) {
    hud = document.createElement('div');
    hud.id = 'visual-agent-hud';
    hud.style.position = 'fixed';
    hud.style.bottom = '20px';
    hud.style.right = '20px';
    hud.style.backgroundColor = '#1e293b';
    hud.style.color = '#f8fafc';
    hud.style.padding = '12px 16px';
    hud.style.borderRadius = '8px';
    hud.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.5)';
    hud.style.zIndex = '999999';
    hud.style.fontSize = '14px';
    hud.style.border = '1px solid #6366f1';
    document.body.appendChild(hud);
  }
  hud.textContent = `🤖 Agent: ${thought}`;
}
