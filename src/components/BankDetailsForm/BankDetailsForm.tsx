import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface BankDetails {
    memberBankAccount: string;
    memberIFSC: string;
    memberBankAddress: string;
    mphBankAccount: string;
    mphIFSC: string;
    mphBankAddress: string;
}

interface BankDetailsFormProps {
    bankDetails: BankDetails;
}

export default function BankDetailsForm({ bankDetails }: BankDetailsFormProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
                <Label htmlFor="memberBankAccount">Member Bank Account Number</Label>
                <Input id="memberBankAccount" name="memberBankAccount" value={bankDetails.memberBankAccount} readOnly className="mt-1" />
            </div>
            <div>
                <Label htmlFor="memberIFSC">Member IFSC Code</Label>
                <Input id="memberIFSC" name="memberIFSC" value={bankDetails.memberIFSC} readOnly className="mt-1" />
            </div>
            <div className="col-span-full">
                <Label htmlFor="memberBankAddress">Member Bank Address</Label>
                <Input id="memberBankAddress" name="memberBankAddress" value={bankDetails.memberBankAddress} readOnly className="mt-1" />
            </div>
            <div>
                <Label htmlFor="mphBankAccount">MPH Bank Account Number</Label>
                <Input id="mphBankAccount" name="mphBankAccount" value={bankDetails.mphBankAccount} readOnly className="mt-1" />
            </div>
            <div>
                <Label htmlFor="mphIFSC">MPH IFSC Code</Label>
                <Input id="mphIFSC" name="mphIFSC" value={bankDetails.mphIFSC} readOnly className="mt-1" />
            </div>
            <div className="col-span-full">
                <Label htmlFor="mphBankAddress">MPH Bank Address</Label>
                <Input id="mphBankAddress" name="mphBankAddress" value={bankDetails.mphBankAddress} readOnly className="mt-1" />
            </div>
        </div>
    )
}