import { AppBar, Box, Button, IconButton, Stack, Toolbar, Tooltip, Typography } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate } from 'react-router-dom';
import LedgerSelect from './LedgerSelect.js';

interface Props {
  pendingOffline: number;
  onLogout: () => void;
}

const TopBar = ({ pendingOffline, onLogout }: Props) => {
  const navigate = useNavigate();
  return (
    <AppBar position="sticky" color="inherit" elevation={1} sx={{ borderBottom: '1px solid #e5e7eb' }}>
      <Toolbar sx={{ display: 'flex', gap: 2 }}>
        <Typography variant="h6" fontWeight={800} color="primary.main">
          QDD
        </Typography>
        <LedgerSelect />
        <Box flex={1} />
        {pendingOffline > 0 && (
          <Stack direction="row" spacing={1} alignItems="center">
            <CloudOffIcon fontSize="small" color="warning" />
            <Typography variant="body2">待同步 {pendingOffline}</Typography>
          </Stack>
        )}
        <Tooltip title="设置">
          <IconButton onClick={() => navigate('/settings')}>
            <SettingsIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="退出登录">
          <IconButton onClick={onLogout}>
            <LogoutIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
