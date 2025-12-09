import { useState } from 'react';
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import TopBar from '../components/TopBar.js';
import { useLogout } from '../api/hooks.js';
import { useChangePassword } from '../api/hooks.js';
import { useOfflineQueue } from '../hooks/useOfflineQueue.js';
import { useAuth } from '../hooks/useAuth.js';

const SettingsPage = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const mutation = useChangePassword();
  const logout = useLogout();
  const ledgerId = useAuth((s) => s.ledgerId);
  const { pending } = useOfflineQueue(ledgerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      await mutation.mutateAsync({ currentPassword, newPassword });
      setMessage('密码已更新');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setMessage(err?.response?.data?.message || '更新失败');
    }
  };

  return (
    <Box>
      <TopBar pendingOffline={pending} onLogout={logout} />
      <Box maxWidth="720px" mx="auto" p={2}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>
            安全设置
          </Typography>
          {message && <Alert severity={mutation.isError ? 'error' : 'success'} sx={{ mb: 2 }}>{message}</Alert>}
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField label="当前密码" type="password" value={currentPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)} required />
              <TextField label="新密码" type="password" value={newPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)} required helperText="至少 8 位" />
              <Button type="submit" variant="contained" disabled={mutation.isPending}>
                {mutation.isPending ? '保存中...' : '修改密码'}
              </Button>
            </Stack>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default SettingsPage;
