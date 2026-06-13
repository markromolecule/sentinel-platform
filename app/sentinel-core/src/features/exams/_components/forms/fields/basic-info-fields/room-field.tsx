import {
    Badge,
    Button,
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Popover,
    PopoverContent,
    PopoverTrigger,
    cn,
} from '@sentinel/ui';
import { AlertTriangle, Check, ChevronsUpDown, MapPin } from 'lucide-react';
import type { ExamFormFieldProps } from '../_types';
import { getSelectedRoomLabel, type RoomOption, type RoomOptionGroup } from './room-field.utils';

type RoomFieldProps = ExamFormFieldProps & {
    isOpen: boolean;
    isRoomsLoading: boolean;
    isRoomsAvailabilityLoading: boolean;
    onOpenChange: (open: boolean) => void;
    roomGroups: RoomOptionGroup[];
    selectedRoomOption?: RoomOption;
};

const labelClassName = 'text-[13px] font-bold text-foreground/70 flex items-center gap-2';
const triggerClassName =
    'h-10 w-full justify-between border-border/60 bg-background px-3 font-normal transition-all hover:bg-[#323d8f]/5 focus:ring-2 focus:ring-[#323d8f]/20 focus:border-[#323d8f]';

export function RoomField({
    control,
    isOpen,
    isRoomsLoading,
    isRoomsAvailabilityLoading,
    onOpenChange,
    roomGroups,
    selectedRoomOption,
}: RoomFieldProps) {
    return (
        <FormField
            control={control}
            name="roomId"
            render={({ field: { value, onChange } }) => (
                <FormItem className="space-y-2">
                    <FormLabel className={labelClassName}>
                        <MapPin className="h-4 w-4 text-[#323d8f]/60" />
                        Room
                    </FormLabel>
                    <Popover open={isOpen} onOpenChange={onOpenChange} modal>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                    type="button"
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={isOpen}
                                    className={triggerClassName}
                                >
                                    <span className="text-foreground/80 mr-2 flex-1 truncate text-left">
                                        {selectedRoomOption
                                            ? getSelectedRoomLabel(selectedRoomOption)
                                            : isRoomsLoading
                                              ? 'Loading rooms...'
                                              : 'Select a room (optional)'}
                                    </span>
                                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                            className="w-[--radix-popover-trigger-width] p-0 shadow-xl"
                            align="start"
                        >
                            <Command>
                                <CommandInput placeholder="Search by room name, number, code, or type..." />
                                <CommandList className="max-h-[260px] overflow-y-auto">
                                    <CommandEmpty>
                                        {isRoomsLoading
                                            ? 'Loading rooms...'
                                            : 'No rooms found for your institution.'}
                                    </CommandEmpty>
                                    <CommandGroup heading="Selection">
                                        <CommandItem
                                            value="No room assignment optional clear"
                                            onSelect={() => {
                                                onChange(undefined);
                                                onOpenChange(false);
                                            }}
                                            className="px-3 py-2"
                                        >
                                            <Check
                                                className={cn(
                                                    'mr-2 h-4 w-4 text-[#323d8f]',
                                                    !value ? 'opacity-100' : 'opacity-0',
                                                )}
                                            />
                                            <div className="flex min-w-0 flex-col">
                                                <span className="text-foreground/90 truncate font-semibold">
                                                    No room assignment
                                                </span>
                                                <span className="text-muted-foreground truncate text-xs">
                                                    Leave the exam without a reserved room.
                                                </span>
                                            </div>
                                        </CommandItem>
                                    </CommandGroup>
                                    {roomGroups.map((group) => (
                                        <CommandGroup key={group.heading} heading={group.heading}>
                                            {group.options.map((option) => (
                                                <CommandItem
                                                    key={option.room.id}
                                                    value={option.searchValue}
                                                    disabled={option.isUnavailable}
                                                    onSelect={() => {
                                                        if (option.isUnavailable) {
                                                            return;
                                                        }

                                                        onChange(
                                                            option.room.id === value
                                                                ? undefined
                                                                : option.room.id,
                                                        );
                                                        onOpenChange(false);
                                                    }}
                                                    className={cn(
                                                        'px-3 py-2',
                                                        option.isUnavailable &&
                                                            'cursor-not-allowed opacity-60',
                                                    )}
                                                >
                                                    <Check
                                                        className={cn(
                                                            'mr-2 h-4 w-4 text-[#323d8f]',
                                                            value === option.room.id
                                                                ? 'opacity-100'
                                                                : 'opacity-0',
                                                        )}
                                                    />
                                                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-foreground/90 truncate font-semibold">
                                                                {option.room.name}
                                                            </span>
                                                            <Badge
                                                                variant="outline"
                                                                className="shrink-0 text-[10px] uppercase"
                                                            >
                                                                {option.room.room_type}
                                                            </Badge>
                                                            {option.isUnavailable ? (
                                                                <Badge
                                                                    variant="outline"
                                                                    className={cn(
                                                                        'text-[10px]',
                                                                        option.room.status ===
                                                                            'MAINTENANCE'
                                                                            ? 'border-amber-500/40 bg-amber-50 text-amber-700'
                                                                            : option.room.status ===
                                                                                'ASSIGNED'
                                                                              ? 'border-blue-500/40 bg-blue-50 text-blue-700'
                                                                              : 'border-amber-500/40 bg-amber-50 text-amber-700',
                                                                    )}
                                                                >
                                                                    {option.room.status ===
                                                                    'MAINTENANCE'
                                                                        ? 'Maintenance'
                                                                        : option.room.status ===
                                                                            'ASSIGNED'
                                                                          ? 'Assigned'
                                                                          : 'Unavailable'}
                                                                </Badge>
                                                            ) : null}
                                                        </div>
                                                        <span className="text-muted-foreground truncate text-xs">
                                                            {option.metaLabel}
                                                        </span>
                                                        {option.conflict ? (
                                                            <span className="truncate text-xs text-amber-700">
                                                                Busy for {option.conflict.examTitle}{' '}
                                                                • {option.conflict.timeLabel}
                                                            </span>
                                                        ) : isRoomsAvailabilityLoading ? (
                                                            <span className="text-muted-foreground truncate text-xs">
                                                                Checking current exam schedule
                                                                usage...
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    ))}
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    {selectedRoomOption?.conflict ? (
                        <p className="flex items-start gap-2 text-xs text-amber-700">
                            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            <span>
                                This room overlaps with {selectedRoomOption.conflict.examTitle} (
                                {selectedRoomOption.conflict.timeLabel}). Pick another room or
                                adjust the schedule.
                            </span>
                        </p>
                    ) : null}
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
