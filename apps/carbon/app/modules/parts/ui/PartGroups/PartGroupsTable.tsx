import { Enumerable, MenuIcon, MenuItem } from "@carbon/react";
import { useNavigate } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import { memo, useCallback, useMemo } from "react";
import { BsFillPenFill } from "react-icons/bs";
import { IoMdTrash } from "react-icons/io";
import { New, Table } from "~/components";
import { usePermissions, useUrlParams } from "~/hooks";
import type { PartGroup } from "~/modules/parts";
import { path } from "~/utils/path";

type PartGroupsTableProps = {
  data: PartGroup[];
  count: number;
};

const PartGroupsTable = memo(({ data, count }: PartGroupsTableProps) => {
  const [params] = useUrlParams();
  const navigate = useNavigate();
  const permissions = usePermissions();

  const rows = useMemo(() => data, [data]);

  const columns = useMemo<ColumnDef<(typeof rows)[number]>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <Enumerable
            value={row.original.name}
            onClick={() =>
              navigate(
                `${path.to.partGroup(row.original.id)}?${params.toString()}`
              )
            }
            className="cursor-pointer"
          />
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: (item) => item.getValue(),
      },
    ],
    [navigate, params]
  );

  const renderContextMenu = useCallback(
    (row: (typeof rows)[number]) => {
      return (
        <>
          <MenuItem
            disabled={!permissions.can("update", "parts")}
            onClick={() => {
              navigate(`${path.to.partGroup(row.id)}?${params.toString()}`);
            }}
          >
            <MenuIcon icon={<BsFillPenFill />} />
            Edit Part Group
          </MenuItem>
          <MenuItem
            disabled={!permissions.can("delete", "parts")}
            onClick={() => {
              navigate(
                `${path.to.deletePartGroup(row.id)}?${params.toString()}`
              );
            }}
          >
            <MenuIcon icon={<IoMdTrash />} />
            Delete Part Group
          </MenuItem>
        </>
      );
    },
    [navigate, params, permissions]
  );

  return (
    <Table<(typeof rows)[number]>
      data={data}
      columns={columns}
      count={count}
      primaryAction={
        permissions.can("create", "parts") && (
          <New
            label="Part Group"
            to={`${path.to.newPartGroup}?${params.toString()}`}
          />
        )
      }
      renderContextMenu={renderContextMenu}
    />
  );
});

PartGroupsTable.displayName = "PartGroupsTable";
export default PartGroupsTable;
