import { useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Link, Stack, TextField, Typography, Alert, Paper } from '@mui/material';
import { useLogin } from '../api/hooks';
import { useAuth } from '../hooks/useAuth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const mutation = useLogin();
  const setAuth = useAuth((s) => s.setAuth);
  const navigate = useNavigate();
  const location = useLocation() as any;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const data = await mutation.mutateAsync({ email, password });
      setAuth({ token: data.token, user: data.user, ledgerId: data.defaultLedgerId ?? null });
      navigate(location.state?.from?.pathname || '/');
    } catch (err: any) {
      setError(err?.response?.data?.message || '登录失败');
    }
  };

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" sx={{ background: 'linear-gradient(135deg,#0f766e,#0b1720)' }}>
      <Paper elevation={6} sx={{ p: 4, width: 380, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          QDD 登录
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          记录每一笔收入和支出
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField label="邮箱" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <TextField label="密码" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Button type="submit" variant="contained" size="large" disabled={mutation.isPending}>
              {mutation.isPending ? '登录中...' : '登录'}
            </Button>
            <Link component={RouterLink} to="/register" underline="hover">
              还没有账号？注册
            </Link>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default LoginPage;
