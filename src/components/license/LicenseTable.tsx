import { useState, useMemo } from 'react';
import {
  Table,
  Badge,
  ActionIcon,
  Group,
  Text,
  Tooltip,
  Menu,
  Pagination,
  Box,
  Paper,
  Input,
  Select,
} from '@mantine/core';
import {
  IconEdit,
  IconEye,
  IconTrash,
  IconDots,
  IconStar,
  IconStarFilled,
  IconDownload,
  IconLicense,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useKeys, useSetDefaultKey, useDeleteKey } from '../../lib/queries/settings';
import { TableLoading } from '../ui';
import { modals } from '@mantine/modals';
import type { License } from '../../lib/validator/license';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';
import type { PaginationState, SortingState } from '@tanstack/react-table';
import { Icons } from '../icons';

interface LicenseTableProps {
  onEditLicense?: (license: License) => void;
  isLoading?: boolean;
}

export function LicenseTable({ onEditLicense, isLoading: externalIsLoading }: LicenseTableProps) {
  const { t } = useTranslation(['licenses', 'common']);
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'uploaded_at', desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isLoading: queryIsLoading } = useKeys({ page, size });
  const setDefaultMutation = useSetDefaultKey();
  const deleteMutation = useDeleteKey();
  
  // Use external loading state if provided, otherwise use query loading state
  const isLoading = externalIsLoading !== undefined ? externalIsLoading : queryIsLoading;

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'expired':
        return 'red';
      case 'invalid':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const handleDelete = (license: License) => {
    modals.openConfirmModal({
      title: t('licenses:delete.title'),
      children: (
        <Text size="sm">
          {t('licenses:delete.message', { name: license.name })}
        </Text>
      ),
      labels: { 
        confirm: t('common:button.delete'), 
        cancel: t('common:button.cancel') 
      },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteMutation.mutate(license.id),
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Format date to human readable
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return 'Today';
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else if (diffDays < 30) {
        return `${Math.floor(diffDays / 7)} weeks ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch (e) {
      return dateString;
    }
  };

  const columnHelper = createColumnHelper<License>();

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: t('licenses:table.name'),
        cell: (info) => (
          <Box>
            <Text fw={500}>{info.getValue()}</Text>
            <Text size="xs" c="dimmed">
              {info.row.original.file_name}
            </Text>
          </Box>
        ),
      }),
      columnHelper.accessor('file_size', {
        header: t('licenses:table.fileSize'),
        cell: (info) => <Text size="sm">{formatFileSize(info.getValue())}</Text>,
      }),
      columnHelper.accessor('status', {
        header: t('licenses:table.status'),
        cell: (info) => (
          <Badge color={getStatusBadgeColor(info.getValue())} variant="filled">
            {t(`licenses:status.${info.getValue()}`)}
          </Badge>
        ),
      }),
      columnHelper.accessor('uploaded_by', {
        header: t('licenses:table.uploadedBy'),
        cell: (info) => <Text size="sm">{info.getValue()}</Text>,
      }),
      columnHelper.accessor('uploaded_at', {
        header: t('licenses:table.uploadedAt'),
        cell: (info) => <Text size="sm" c="dimmed">{formatDate(info.getValue())}</Text>,
      }),
      columnHelper.accessor('expires_at', {
        header: t('licenses:table.expiresAt'),
        cell: (info) => (
          <Text size="sm" c="dimmed">
            {info.getValue() ? formatDate(info.getValue()!) : t('licenses:table.noExpiry')}
          </Text>
        ),
      }),
      columnHelper.accessor('is_default', {
        header: t('licenses:table.default'),
        cell: (info) => (
          <Tooltip label={info.getValue() ? t('licenses:table.defaultLicense') : t('licenses:table.setAsDefault')}>
            <ActionIcon
              variant={info.getValue() ? 'filled' : 'subtle'}
              color="yellow"
              onClick={() => !info.getValue() && setDefaultMutation.mutate(info.row.original.id)}
              disabled={info.getValue()}
            >
              {info.getValue() ? <IconStarFilled size={16} /> : <IconStar size={16} />}
            </ActionIcon>
          </Tooltip>
        ),
      }),
      columnHelper.accessor('id', {
        header: t('licenses:table.actions'),
        cell: (info) => {
          const license = info.row.original;
          return (
            <Group gap="xs" justify="flex-end">
              <Tooltip label={t('common:button.view')}>
                <ActionIcon
                  variant="subtle"
                  onClick={() => navigate(`/licenses/${info.getValue()}`)}
                >
                  <IconEye size={16} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label={t('common:button.edit')}>
                <ActionIcon
                  variant="subtle"
                  onClick={() => onEditLicense?.(license)}
                >
                  <IconEdit size={16} />
                </ActionIcon>
              </Tooltip>
              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <ActionIcon variant="subtle">
                    <IconDots size={16} />
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<IconDownload size={14} />}
                    onClick={() => {/* TODO: Implement download */}}
                  >
                    {t('licenses:actions.download')}
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    color="red"
                    leftSection={<IconTrash size={14} />}
                    onClick={() => handleDelete(license)}
                  >
                    {t('licenses:actions.delete')}
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          );
        },
      }),
    ],
    [t, navigate, onEditLicense, setDefaultMutation, deleteMutation]
  );

  const licenses = data?.results || [];

  const table = useReactTable({
    data: licenses,
    columns,
    state: {
      sorting,
      globalFilter,
      pagination,
    },
    enableGlobalFilter: true,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: false,
  });

  // Show loading state
  if (isLoading) {
    return (
      <TableLoading
        rows={5}
        columns={7}
        withPagination={true}
        withSearch={true}
        withActions={true}
      />
    );
  }

  // Show empty state
  if (licenses.length === 0) {
    return (
      <TableLoading
        noData={true}
        noDataMessage={t('licenses:noLicenses')}
        emptyIcon={<IconLicense size={48} opacity={0.7} />}
      />
    );
  }

  // Show table with data
  return (
    <Paper withBorder p="md">
      <Group justify="flex-end" mb="md">
        <Input
          placeholder={t('common:action.search')}
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          leftSection={<Icons.Search size={16} />}
          style={{ maxWidth: 300 }}
        />
      </Group>

      <Table
        verticalSpacing="md"
        horizontalSpacing="md"
        striped
        withTableBorder
        mb="md"
      >
        <Table.Thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <Table.Th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  style={{
                    cursor: header.column.getCanSort() ? 'pointer' : 'default',
                    width: header.id === 'id' ? 120 : header.id === 'is_default' ? 80 : 'auto',
                    textAlign: header.id === 'is_default' ? 'center' : undefined,
                  }}
                >
                  <Group justify="space-between" style={{ flexWrap: 'nowrap' }}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {header.column.getCanSort() && (
                      <Box style={{ display: 'inline-block', width: 16 }}>
                        {header.column.getIsSorted() === 'asc' ? (
                          <Icons.ArrowUp size={16} />
                        ) : header.column.getIsSorted() === 'desc' ? (
                          <Icons.ArrowDown size={16} />
                        ) : (
                          <Icons.Sort size={16} style={{ opacity: 0.5 }} />
                        )}
                      </Box>
                    )}
                  </Group>
                </Table.Th>
              ))}
            </Table.Tr>
          ))}
        </Table.Thead>
        <Table.Tbody>
          {table.getRowModel().rows.map((row) => (
            <Table.Tr
              key={row.id}
              onClick={() => navigate(`/licenses/${row.original.id}`)}
              style={{
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {row.getVisibleCells().map((cell) => (
                <Table.Td 
                  key={cell.id}
                  onClick={(e) => {
                    // Prevent row click for action columns
                    if (cell.column.id === 'id' || cell.column.id === 'is_default') {
                      e.stopPropagation();
                    }
                  }}
                  style={{
                    textAlign: cell.column.id === 'is_default' ? 'center' : undefined,
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Table.Td>
              ))}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Group justify="space-between">
        <Group gap="xs">
          <Text size="sm">
            {t('common:pagination.showing')}{' '}
            {table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize +
              1}{' '}
            -{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{' '}
            {t('common:pagination.of')}{' '}
            {table.getFilteredRowModel().rows.length}
          </Text>
          <Select
            size="xs"
            value={String(table.getState().pagination.pageSize)}
            onChange={(value) => table.setPageSize(Number(value))}
            data={['5', '10', '20', '30', '40', '50'].map((pageSize) => ({
              value: pageSize,
              label: `${pageSize} ${t('common:pagination.per_page')}`,
            }))}
            w={110}
            radius="xl"
          />
        </Group>
        <Pagination
          total={table.getPageCount()}
          value={table.getState().pagination.pageIndex + 1}
          onChange={(page) => table.setPageIndex(page - 1)}
          color="blue"
          size="sm"
          radius="xl"
          withEdges
        />
      </Group>
    </Paper>
  );
}