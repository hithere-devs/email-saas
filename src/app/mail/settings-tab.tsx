"use client";

// utils
import { cn } from "@/lib/utils";

// api
import { api } from "@/trpc/react";
import { Trash } from "lucide-react";

import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Account } from "@prisma/client";

const SettingsTab = () => {
  const { data } = api.account.getAccounts.useQuery();

  const [accounts, setAccounts] = useState<Account[]>(data || []);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

  const deleteAccount = api.account.deleteAccount.useMutation()

  const handleDelete = () => {
    if (!accountToDelete) return;

    try {
      // Call API to delete the account
      deleteAccount.mutate({ accountId: accountToDelete.id });
      setAccounts(accounts.filter((account) => account.id !== accountToDelete.id));
      console.log("deleted")
    } catch (error) {
      console.error("Failed to delete account:", error);
    } finally {
      setIsModalOpen(false); // Close the modal after deletion
      setAccountToDelete(null); // Reset selected account
    }
  };

  const openModal = (account: Account) => {
    setAccountToDelete(account);
    setIsModalOpen(true);
  };
  return (
    <div className="mt-4 overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead className="bg-gray-50 dark:bg-gray-800">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Accounts
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            
          </th>
          {/* Add more columns as needed */}
        </tr>
      </thead>
      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
      {data?.map((account) => (
        <tr key={account.id}>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
            {account.emailAddress}
          </td>
          <td className="px-6 py-4 text-right">
            <button
              onClick={() => openModal(account)}
              className="text-gray-400 hover:text-red-500 transition-colors duration-200"
              aria-label="Delete Account"
            >
              <Trash className="w-5 h-5 cursor-pointer" />
            </button>
          </td>
        </tr>
      ))}
      </tbody>
    </table>

     <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the account for {accountToDelete?.emailAddress}?
          </DialogDescription>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SettingsTab;