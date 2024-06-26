import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { deleteEquipmentType } from "~/modules/resources";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import { path } from "~/utils/path";
import { error, success } from "~/utils/result";

export async function action({ request, params }: LoaderFunctionArgs) {
  const { client } = await requirePermissions(request, {
    delete: "resources",
  });

  const { typeId } = params;
  if (!typeId) {
    throw redirect(
      path.to.equipment,
      await flash(request, error(params, "Failed to get a equipment type id"))
    );
  }

  const deactivateEquipmentType = await deleteEquipmentType(client, typeId);
  if (deactivateEquipmentType.error) {
    throw redirect(
      path.to.equipment,
      await flash(
        request,
        error(
          deactivateEquipmentType.error,
          "Failed to deactivate equipment type"
        )
      )
    );
  }

  throw redirect(
    path.to.equipment,
    await flash(request, success("Successfully deactivated equipment type"))
  );
}
