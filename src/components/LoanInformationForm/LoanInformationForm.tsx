import React from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

interface LoanDetails {
    loanType: string;
    lan: string;
    policyNumber: string;
    planNumber: string;
    panNumber: string;
    originalLoanAmount: number;
    sumAssured: number;
    minSumAssured: number;
    maxSumAssured: number;
    minTerm: number;
    maxTerm: number;
    policyTerm: number;
    riskCommencementDate: string;
}

interface LoanInformationFormProps {
    loanDetails: LoanDetails;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSelectChange: (name: string, value: string) => void;
    onDateChange: (name: string, date: Date | undefined) => void;
    sumAssuredError: string;
}

export default function LoanInformationForm({
    loanDetails,
    onInputChange,
    onSelectChange,
    onDateChange,
    sumAssuredError
}: LoanInformationFormProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
                <Label htmlFor="loanType">Loan Type</Label>
                <Input id="loanType" name="loanType" value={loanDetails.loanType} readOnly className="mt-1" />
            </div>
            <div>
                <Label htmlFor="lan">LAN</Label>
                <Input id="lan" name="lan" value={loanDetails.lan} readOnly className="mt-1" />
            </div>
            <div>
                <Label htmlFor="policyNumber">Policy Number</Label>
                <Input id="policyNumber" name="policyNumber" value={loanDetails.policyNumber} readOnly className="mt-1" />
            </div>
            <div>
                <Label htmlFor="planNumber">Plan Number</Label>
                <Input id="planNumber" name="planNumber" value={loanDetails.planNumber} readOnly className="mt-1" />
            </div>
            <div>
                <Label htmlFor="panNumber">PAN Number</Label>
                <Input id="panNumber" name="panNumber" value={loanDetails.panNumber} readOnly className="mt-1" />
            </div>
            <div>
                <Label htmlFor="originalLoanAmount">Original Loan Amount</Label>
                <Input id="originalLoanAmount" name="originalLoanAmount" value={loanDetails.originalLoanAmount} readOnly className="mt-1 bg-white" />
            </div>
            <div>
                <Label htmlFor="sumAssured">Sum Assured</Label>
                <Input
                    id="sumAssured"
                    name="sumAssured"
                    value={loanDetails.sumAssured}
                    onChange={onInputChange}
                    className={`mt-1 ${sumAssuredError ? 'border-red-500' : ''}`}
                />
                {sumAssuredError && <p className="text-red-500 text-sm mt-1">{sumAssuredError}</p>}
            </div>
            <div>
                <Label htmlFor="policyTerm">Policy Term</Label>
                <Select name="policyTerm" value={loanDetails.policyTerm.toString()} onValueChange={(value) => onSelectChange('policyTerm', value)}>
                    <SelectTrigger id="policyTerm" data-testid="policyTerm" className="mt-1">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {[...Array(loanDetails.maxTerm - loanDetails.minTerm + 1)].map((_, i) => (
                            <SelectItem key={i + loanDetails.minTerm} value={(i + loanDetails.minTerm).toString()}>
                                {i + loanDetails.minTerm}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="riskCommencementDate">Risk Commencement Date</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full mt-1 justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {loanDetails.riskCommencementDate ? format(new Date(loanDetails.riskCommencementDate), "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={new Date(loanDetails.riskCommencementDate)}
                            onSelect={(date) => onDateChange('riskCommencementDate', date)}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}