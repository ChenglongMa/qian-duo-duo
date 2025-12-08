import { useMemo } from 'react';
import { Alert, Box, Card, CardContent, Chip, Divider, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import dayjs from 'dayjs';
import ReactECharts from 'echarts-for-react';
import EntryForm, { EntryFormValues } from '../components/EntryForm';
import TopBar from '../components/TopBar';
import { useAuth } from '../hooks/useAuth';
import { useCreateEntry, useEntries } from '../api/hooks';
import { useOfflineQueue } from '../hooks/useOfflineQueue';
import { useLogout } from '../api/hooks';

const DashboardPage = () => {
  const ledgerId = useAuth((s) => s.ledgerId);
  const { data: entries, isLoading, error } = useEntries(ledgerId);
  const createEntry = useCreateEntry(ledgerId);
  const { pending, queueEntry } = useOfflineQueue(ledgerId);
  const logout = useLogout();

  const onSubmit = async (values: EntryFormValues) => {
    if (!ledgerId) return;
    try {
      await createEntry.mutateAsync({
        ...values,
        note: values.note || undefined
      });
    } catch (err: any) {
      if (!navigator.onLine || err?.code === 'ERR_NETWORK') {
        await queueEntry({
          ...values,
          ledgerId
        });
      } else {
        throw err;
      }
    }
  };

  const chartOption = useMemo(() => {
    const grouped: Record<string, number> = {};
    (entries || []).forEach((e: any) => {
      const day = dayjs(e.date).format('YYYY-MM-DD');
      grouped[day] = (grouped[day] || 0) + Number(e.amount);
    });
    const days = Object.keys(grouped).sort();
    return {
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: days },
      yAxis: { type: 'value' },
      series: [
        {
          data: days.map((d) => grouped[d]),
          type: 'bar',
          smooth: true,
          itemStyle: { color: '#0f766e' }
        }
      ],
      grid: { left: 40, right: 12, top: 20, bottom: 30 }
    };
  }, [entries]);

  return (
    <Box>
      <TopBar pendingOffline={pending} onLogout={logout} />
      <Box maxWidth="1200px" mx="auto" p={2} pb={6}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 5 }}>
            <EntryForm onSubmit={onSubmit} />
            {pending > 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                离线记录 {pending} 条，联网后自动同步。
              </Alert>
            )}
            {!navigator.onLine && (
              <Alert severity="info" sx={{ mt: 2 }}>
                当前离线模式，已切换到本地缓存。
              </Alert>
            )}
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography fontWeight={700} mb={1}>
                  近期开支
                </Typography>
                <ReactECharts option={chartOption} style={{ height: 240 }} />
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                  <Typography fontWeight={700}>账目列表</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {entries?.length || 0} 条
                  </Typography>
                </Stack>
                <Divider sx={{ mb: 2 }} />
                {error && <Alert severity="error">{(error as any)?.message}</Alert>}
                {isLoading && <Typography>加载中...</Typography>}
                <Stack spacing={1.5}>
                  {(entries || []).map((entry: any) => (
                    <Box key={entry.id} sx={{ p: 1.5, border: '1px solid #e5e7eb', borderRadius: 2, backgroundColor: '#fff' }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack spacing={0.5}>
                          <Typography fontWeight={700}>{entry.note || entry.merchant?.name || entry.category?.name || '未分类'}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {dayjs(entry.date).format('YYYY-MM-DD HH:mm')} · {entry.currency} {entry.amount}
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip label={entry.type === 'expense' ? '支出' : '收入'} color={entry.type === 'expense' ? 'default' : 'success'} size="small" />
                          {entry.status === 'pending_review' && <Chip label="待确认" color="warning" size="small" />}
                        </Stack>
                      </Stack>
                    </Box>
                  ))}
                  {(entries || []).length === 0 && !isLoading && <Typography color="text.secondary">暂无记录</Typography>}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default DashboardPage;
