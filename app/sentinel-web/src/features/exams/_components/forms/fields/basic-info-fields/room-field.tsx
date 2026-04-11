import type { Room } from '@sentinel/shared/types';
import {
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
import { Check, ChevronsUpDown, MapPin } from 'lucide-react';
import type { ExamFormFieldProps } from '../_types';

type RoomFieldProps = ExamFormFieldProps & {
    isOpen: boolean;
    isRoomsLoading: boolean;
    onOpenChange: (open: boolean) => void;
    rooms: Room[];
    selectedRoom?: Room;
};

const labelClassName = 'text-[13px] font-bold text-foreground/70 flex items-center gap-2';
const triggerClassName =
    'h-11 w-full justify-between border-border/60 bg-background px-3 font-normal transition-all hover:bg-[#323d8f]/5 focus:ring-2 focus:ring-[#323d8f]/20 focus:border-[#323d8f]';

function getRoomLabel(room: Room) {
    return room.code ? `${room.name} (${room.code})` : room.name;
}

export function RoomField({
    control,
    isOpen,
    isRoomsLoading,
    onOpenChange,
    rooms,
    selectedRoom,
}: RoomFieldProps) {
    return (
        <FormField
            control={control}
            name="roomId"
            render={({ field: { value, onChange } }) => (
                <FormItem className="space-y-2.5">
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
                                    <span className="mr-2 flex-1 truncate text-left text-foreground/80">
                                        {selectedRoom
                                            ? getRoomLabel(selectedRoom)
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
                                <CommandInput placeholder="Search rooms..." />
                                <CommandList className="max-h-[260px] overflow-y-auto">
                                    <CommandEmpty>
                                        {isRoomsLoading
                                            ? 'Loading rooms...'
                                            : 'No rooms found for your institution.'}
                                    </CommandEmpty>
                                    <CommandGroup>
                                        {rooms.map((room) => (
                                            <CommandItem
                                                key={room.id}
                                                value={`${room.name} ${room.code ?? ''} ${room.room_type}`}
                                                onSelect={() => {
                                                    onChange(
                                                        room.id === value ? undefined : room.id,
                                                    );
                                                    onOpenChange(false);
                                                }}
                                                className="px-3 py-2"
                                            >
                                                <Check
                                                    className={cn(
                                                        'mr-2 h-4 w-4 text-[#323d8f]',
                                                        value === room.id
                                                            ? 'opacity-100'
                                                            : 'opacity-0',
                                                    )}
                                                />
                                                <div className="flex min-w-0 flex-col">
                                                    <span className="truncate font-semibold text-foreground/90">
                                                        {room.name}
                                                    </span>
                                                    <span className="text-muted-foreground truncate text-xs">
                                                        {room.code
                                                            ? `${room.code} • ${room.room_type}`
                                                            : room.room_type}
                                                    </span>
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
