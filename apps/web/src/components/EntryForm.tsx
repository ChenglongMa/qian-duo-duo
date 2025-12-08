import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button, MenuItem, Paper, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import dayjs from 'dayjs';
import { useCategories } from '../api/hooks';
import { useAuth } from '../hooks/useAuth';

const schema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive(),
  currency: z.string().length(3),
  date: z.string(),
  categoryId: z.string().optional().nullable(),
  note: z.string().max(500).optional().nullable()
});

export type EntryFormValues = z.infer<typeof schema>;

interface Props {
  onSubmit: (values: EntryFormValues) => Promise<void>;
}

const EntryForm = ({ onSubmit }: Props) => {
  const ledgerId = useAuth((s) => s.ledgerId);
  const { data: categories } = useCategories(ledgerId);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { isSubmitting }
  } = useForm<EntryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'expense',
      currency: 'CNY',
      date: dayjs().format('YYYY-MM-DDTHH:mm')
    }
  });

  const type = watch('type');

  const submit = async (values: EntryFormValues) => {
    await onSubmit(values);
    reset({
      type: 'expense',
      currency: values.currency,
      date: dayjs().format('YYYY-MM-DDTHH:mm'),
      note: ''
    });
  };

  const options = categories?.filter((c) => c.type === type) ?? [];

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography fontWeight={700}>记一笔</Typography>
      </Stack>
      <form onSubmit={handleSubmit(submit)}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption" color="text.secondary">
              类型
            </Typography>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <ToggleButtonGroup
                  exclusive
                  fullWidth
                  size="small"
                  value={field.value}
                  onChange={(_, value) => field.onChange(value || field.value)}
                >
                  <ToggleButton value="expense">支出</ToggleButton>
                  <ToggleButton value="income">收入</ToggleButton>
                </ToggleButtonGroup>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField label="金额" type="number" fullWidth inputProps={{ step: '0.01' }} {...register('amount')} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField select label="币种" fullWidth defaultValue="CNY" {...register('currency')}>
              {['CNY', 'USD', 'EUR', 'AUD', 'JPY', 'HKD', 'SGD'].map((code) => (
                <MenuItem key={code} value={code}>
                  {code}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="日期时间"
              type="datetime-local"
              fullWidth
              InputLabelProps={{ shrink: true }}
              {...register('date')}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField select label="类别" fullWidth {...register('categoryId')}>
              <MenuItem value="">未选择</MenuItem>
              {options.map((cat: any) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField label="备注" fullWidth multiline minRows={2} {...register('note')} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? '提交中...' : '保存'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default EntryForm;
