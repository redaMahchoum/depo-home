-- V5: Insert Depo Plans Agents
-- Insert agents for the depo-plans infrastructure with their respective URLs, ports, and descriptions

INSERT INTO agents (id, title, description, link_url, port, created_at, updated_at)
VALUES 
('SSH_PROXY', 'SSH Proxy', 'Secure SSH access proxy for remote server management and secure connections.', 'https://gssh.depo-plans.com/991b51cc1c', '22', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('DOCKER_MANAGER', 'Docker Manager', 'Docker container manager UI (Dockge) for managing containerized applications and services.', 'https://dockge.depo-plans.com', '5001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('FILE_BROWSER', 'File Browser', 'Web-based file explorer and manager for server directories with upload, download, and editing capabilities.', 'https://filebrowser.depo-plans.com', '8215', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('DASHBOARD', 'System Dashboard', 'Custom system dashboard for monitoring applications, services, and infrastructure health.', 'https://dashboard.depo-plans.com', '7111', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('RADARR', 'Radarr', 'Movie download manager that works with torrent/nzb clients and integrates with Plex for automated movie collection management.', 'https://radarr.depo-plans.com', '7878', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('SONARR', 'Sonarr', 'TV series download manager with torrent/nzb automation for automated television show collection and monitoring.', 'https://sonarr.depo-plans.com', '8989', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('QBITTORRENT', 'qBittorrent', 'qBittorrent Web UI for managing torrents, downloads, and peer-to-peer file sharing.', 'https://qb.depo-plans.com', '8080', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('JELLYFIN', 'Jellyfin (Flex)', 'Jellyfin media streaming server for movies, TV shows, music, and other media content with web-based interface.', 'https://flex.depo-plans.com', '8096', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('ASK_SERVICE', 'Ask Service', 'Interactive service to ask for recommendations on what show or movie to watch next based on preferences.', 'https://ask.depo-plans.com', '5055', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('AI_CHAT', 'AI Chat', 'AI chat application powered by OpenWebUI for conversational AI interactions and assistance.', 'https://aichat.depo-plans.com', '3858', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('GIST_MANAGER', 'Gist Manager', 'Self-hosted snippet manager and code notes application for storing and organizing code snippets and documentation.', 'https://gist.depo-plans.com', '6157', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Add comment to document this migration
COMMENT ON TABLE agents IS 'Agents table updated with depo-plans infrastructure services in V5 migration'; 