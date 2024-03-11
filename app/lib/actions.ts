'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { signIn, signOut } from './auth';
import { AuthError } from 'next-auth';
import { Signin } from './definitions';

const InvoiceSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer',
    required_error: 'Please select a customer',
  }),
  amount: z.coerce.number().gt(0, 'Please enter an amount greater than $0.'),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status',
    required_error: 'Please select an invoice status',
    description: 'Please select a correct invoice status',
  }),
  date: z.string(),
});

const CreateInvoiceSchema = InvoiceSchema.omit({ id: true, date: true });
const UpdateInvoiceSchema = CreateInvoiceSchema;

type ActionState = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string;
};

export async function CreateInvoiceAction(
  actionState: ActionState,
  form: FormData,
): Promise<ActionState> {
  const entries = Object.fromEntries(form);

  const result = CreateInvoiceSchema.safeParse(entries);
  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
      message: 'Missing fields, failed to create invoice',
    };
  }

  const { customerId, amount, status } = result.data;

  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  try {
    await sql`
    INSERT INTO invoices (customer_id,amount,status,date) 
    VALUES (${customerId},${amountInCents},${status},${date})
    `;
  } catch (error) {
    return {
      message: 'Database Erros: Failded to create invoice',
    };
  }
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function UpdateInvoiceAction(
  invoiceId: string,
  formadata: FormData,
) {
  const entries = Object.fromEntries(formadata);
  const { amount, customerId, status } = UpdateInvoiceSchema.parse(entries);
  const amountInCents = amount * 100;
  await sql`
  UPDATE invoices 
  SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
  WHERE id = ${invoiceId}
  `;
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoiceAction(id: string) {
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices');
}

type SigninActionState = {
  errors?: Partial<Signin>;
  message?: string;
};

export const signinAction = async (
  state: SigninActionState | undefined,
  formdata: FormData,
): Promise<SigninActionState | undefined> => {
  try {
    await signIn('credentials', formdata);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return {
            message: 'Wrong credentials provided',
          };
        default:
          return {
            message: 'Authentication Error',
          };
      }
    }
    throw error;
  }
};

export const signout = async () => {
  try {
    await signOut();
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'SignOutError': {
          alert('Error signing out');
        }
        default:
          alert("Something wen't wrong signing out");
      }
    }
    throw error;
  }
};
