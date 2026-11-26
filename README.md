# AR Printing Solution

The Next.js prototype includes the public printing and apparel storefront, the customer account demo, and a separate operations portal.

## Local preview

Run these commands from the project directory in Windows PowerShell.

```powershell
npm.cmd install
npm.cmd run build
npm.cmd run start -- --hostname 127.0.0.1 --port 4334
```

Open the storefront at `http://127.0.0.1:4334/` or the admin sign-in at `http://127.0.0.1:4334/admin/sign-in`. Select **Use Demo Admin Account** to open the operations workspace. The build writes to `.next-v4` by default so earlier builds can continue serving independently. For development, use `npm.cmd run dev -- --port 4334` when that port is free.

Run `npm.cmd run lint` and `npx.cmd --no-install tsc --noEmit` to check the source.

## Demonstration boundaries

The customer and administrator sessions have separate client-side state. The admin guard only demonstrates navigation. All admin records and monetary figures are fictional, and admin changes live in memory until the workspace is reset, signed out or reloaded. Locally selected images stay in the browser. The admin can explicitly queue a design already saved in the same tab. Product and content previews are internal drafts. Public prices remain **Price on Request**.

The **Reset Demo Data** action under Settings restores the original admin fixtures after confirmation. The demo excludes real order processing, payment, notifications and fulfilment. Sample order and quotation editors use one line per record. Admin routes include no-index metadata.

## Requirements for production

Production deployment requires server-side authentication and role-based authorization, immutable audit records for administrative changes, and secure storage for business data and artwork. Establish data validation and transactional updates for stock and production, an approval and publishing workflow for catalogue and site content, and client-approved pricing, GST and invoicing rules. Integrate payments, email, WhatsApp Business and shipping only after their credentials, policies and operational requirements are approved.
