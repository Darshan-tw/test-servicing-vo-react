import React from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

interface MemberDetails {
    memberNumber: string;
    title: string;
    name: string;
    gender: string;
    dateOfBirth: string;
    address: string;
    phoneNumber: string;
    email: string;
}

interface MemberDetailsFormProps {
    memberDetails: MemberDetails;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSelectChange: (name: string, value: string) => void;
    onDateChange: (name: string, date: Date | undefined) => void;
}

export default function MemberDetailsForm({
    memberDetails,
    onInputChange,
    onSelectChange,
    onDateChange
}: MemberDetailsFormProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
                <Label htmlFor="title">Title</Label>
                <Select name="title" value={memberDetails.title} onValueChange={(value) => onSelectChange('title', value)}>
                    <SelectTrigger className="mt-1" data-testid='gender'>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Mr">Mr</SelectItem>
                        <SelectItem value="Ms">Ms</SelectItem>
                        <SelectItem value="Mrs">Mrs</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={memberDetails.name} readOnly className="mt-1" />
            </div>
            <div>
                <Label htmlFor="gender-select">Gender</Label>
                <Select  value={memberDetails.gender} onValueChange={(value) => onSelectChange('gender', value)}>
                    <SelectTrigger className="mt-1" data-testid="gender-select">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full mt-1 justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {memberDetails.dateOfBirth ? format(new Date(memberDetails.dateOfBirth), "dd/MM/yyyy") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={new Date(memberDetails.dateOfBirth)}
                            onSelect={(date) => onDateChange('dateOfBirth', date)}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
            <div className="col-span-full">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" value={memberDetails.address} readOnly className="mt-1" />
            </div>
            <div>
                <Label htmlFor="phoneNumber">Contact Number</Label>
                <Input id="phoneNumber" name="phoneNumber" value={memberDetails.phoneNumber} onChange={onInputChange} className="mt-1" />
            </div>
            <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" value={memberDetails.email} onChange={onInputChange} className="mt-1" />
            </div>
        </div>
    )
}