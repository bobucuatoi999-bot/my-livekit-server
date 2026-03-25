-- Seed data to test server list display in Dashboard
-- IMPORTANT: replace YOUR_USER_UUID with the id from auth.users

insert into public.servers (
  owner_id,
  name,
  ip_address,
  tailscale_url,
  status,
  os_name,
  ram_mb,
  cpu_cores,
  disk_gb,
  plan_id,
  location
)
values
  (
    'YOUR_USER_UUID',
    'VPS Ubuntu 24.04',
    '103.80.150.32',
    'https://login.tailscale.com/admin/machines',
    'online',
    'Ubuntu 24.04',
    4096,
    2,
    80,
    'business',
    'VN-HCM'
  ),
  (
    'YOUR_USER_UUID',
    'Minecraft Server',
    '103.80.150.45',
    'https://login.tailscale.com/admin/machines',
    'online',
    'Ubuntu 24.04',
    8192,
    4,
    100,
    'enterprise',
    'VN-HCM'
  ),
  (
    'YOUR_USER_UUID',
    'Database Replica',
    '103.80.150.67',
    'https://login.tailscale.com/admin/machines',
    'offline',
    'Ubuntu 24.04',
    2048,
    1,
    40,
    'starter',
    'VN-HN'
  );
