import { Table as MuiTable, TableContainer as MuiTableContainer, Paper } from '@mui/material';
import type { TableProps } from '@mui/material/Table';
import type { TableContainerProps } from '@mui/material/TableContainer';
import { styled } from '@mui/material/styles';

const StyledTableContainer = styled((props: TableContainerProps) => <MuiTableContainer component={Paper} {...props} />)(
  ({ theme }) => ({
    borderRadius: '8px',
    border: `1px solid ${theme.palette.grey[300]}`,
    boxShadow: 'none',
  })
);

const StyledTable = styled(MuiTable)<TableProps>(({ theme }) => ({
  '& .MuiTableHead-root': {
    backgroundColor: theme.palette.grey[100],
    '& .MuiTableCell-root': {
      fontWeight: 'bold',
    },
  },
  '& .MuiTableCell-root': {
    borderBottom: `1px solid ${theme.palette.grey[200]}`,
  },
  '& .MuiTableRow-root:last-of-type .MuiTableCell-root': {
    borderBottom: 'none',
  },
}));

export const Table = (props: TableProps) => {
  return <StyledTable {...props} />;
};

export const TableContainer = (props: TableContainerProps) => {
  return <StyledTableContainer {...props} />;
};
