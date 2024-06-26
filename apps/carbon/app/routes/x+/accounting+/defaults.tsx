import { VStack } from "@carbon/react";
import { validationError, validator } from "@carbon/remix-validated-form";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useRouteData } from "~/hooks";
import type { AccountListItem } from "~/modules/accounting";
import {
  AccountDefaultsForm,
  defaultAcountValidator,
  getDefaultAccounts,
  updateDefaultAccounts,
} from "~/modules/accounting";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import type { Handle } from "~/utils/handle";
import { assertIsPost } from "~/utils/http";
import { path } from "~/utils/path";
import { error, success } from "~/utils/result";

export const handle: Handle = {
  breadcrumb: "Defaults",
  to: path.to.accountingDefaults,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { client } = await requirePermissions(request, {
    view: "accounting",
  });

  const [defaultAccounts] = await Promise.all([getDefaultAccounts(client)]);

  if (defaultAccounts.error || !defaultAccounts.data) {
    throw redirect(
      path.to.accounting,
      await flash(
        request,
        error(defaultAccounts.error, "Failed to load default accounts")
      )
    );
  }

  return json({
    defaultAccounts: defaultAccounts.data,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client, userId } = await requirePermissions(request, {
    create: "accounting",
  });

  const validation = await validator(defaultAcountValidator).validate(
    await request.formData()
  );

  if (validation.error) {
    return validationError(validation.error);
  }

  const updateDefaults = await updateDefaultAccounts(client, {
    ...validation.data,
    updatedBy: userId,
  });
  if (updateDefaults.error) {
    return json(
      {},
      await flash(
        request,
        error(updateDefaults.error, "Failed to update default accounts")
      )
    );
  }

  throw redirect(
    path.to.accountingDefaults,
    await flash(request, success("Updated default accounts"))
  );
}

export default function AccountDefaultsRoute() {
  const { defaultAccounts } = useLoaderData<typeof loader>();
  const routeData = useRouteData<{
    balanceSheetAccounts: AccountListItem[];
    incomeStatementAccounts: AccountListItem[];
  }>(path.to.accounting);

  return (
    <VStack className="h-full p-4 overflow-y-auto">
      <AccountDefaultsForm
        balanceSheetAccounts={routeData?.balanceSheetAccounts ?? []}
        incomeStatementAccounts={routeData?.incomeStatementAccounts ?? []}
        initialValues={defaultAccounts}
      />
    </VStack>
  );
}
