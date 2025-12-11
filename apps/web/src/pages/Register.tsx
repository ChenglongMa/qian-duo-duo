import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Link, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { useRegister } from '../api/hooks.js';
import { useAuth } from '../hooks/useAuth.js';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('AUD');
  const [error, setError] = useState<string | null>(null);
  const mutation = useRegister();
  const setAuth = useAuth((s) => s.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const data = await mutation.mutateAsync({ email, password, name, mainCurrency: currency });
      setAuth({ token: data.token, user: data.user, ledgerId: data.defaultLedgerId ?? null });
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || '注册失败');
    }
  };

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" sx={{ background: 'linear-gradient(135deg,#0f766e,#0b1720)' }}>
      <Paper elevation={6} sx={{ p: 4, width: 420, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          创建 QDD 账号
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          多账本、离线缓存、自动汇率换算
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField label="邮箱" type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} required />
            <TextField label="姓名" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} required />
            <TextField label="密码" type="password" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} required helperText="至少 8 位" />
            <TextField select label="主币种" value={currency} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrency(e.target.value)}>
              {['AUD', 'CNY', 'USD', 'EUR', 'JPY', 'HKD', 'SGD'].map((code) => (
                <MenuItem key={code} value={code}>
                  {code}
                </MenuItem>
              ))}
            </TextField>
            <Button type="submit" variant="contained" size="large" disabled={mutation.isPending}>
              {mutation.isPending ? '注册中...' : '注册'}
            </Button>
            <Link component={RouterLink} to="/login" underline="hover">
              已有账号？去登录
            </Link>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default RegisterPage;
