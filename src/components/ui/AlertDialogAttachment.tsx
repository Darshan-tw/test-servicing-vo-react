
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

interface AlertDialogAttachmentProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description: string;
    actionLabel: string;
}

export default function AlertDialogAttachment({ isOpen, onClose, title, description, actionLabel }: AlertDialogAttachmentProps = {
    isOpen: false,
    onClose: () => { },
    title: "Alert",
    description: "This is an alert dialog.",
    actionLabel: "OK"
}) {
    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={onClose}>{actionLabel}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}