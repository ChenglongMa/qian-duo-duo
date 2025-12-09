import { MenuItem, TextField } from "@mui/material";
import { useLedgers } from "../api/hooks.js";
import { useAuth } from "../hooks/useAuth.js";

const LedgerSelect = () => {
  const { data: ledgers } = useLedgers();
  const ledgerId = useAuth((s) => s.ledgerId);
  const setLedgerId = useAuth((s) => s.setLedgerId);

  return (
    <TextField
      select
      size="small"
      label="账本"
      value={ledgerId ?? ""}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        setLedgerId(e.target.value)
      }
      sx={{ minWidth: 160 }}
    >
      {(ledgers || []).map((ledger) => (
        <MenuItem key={ledger.id} value={ledger.id}>
          {ledger.name}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default LedgerSelect;
