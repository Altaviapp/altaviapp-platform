'use client';

import { Fragment, ReactNode } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { MoreVertical, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ActionMenuItem {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

export interface ActionMenuProps {
  items: ActionMenuItem[];
  trigger?: ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export function ActionMenu({
  items,
  trigger,
  align = 'right',
  className,
}: ActionMenuProps) {
  return (
    <Menu as="div" className={cn('relative inline-block text-left', className)}>
      <Menu.Button
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {trigger || <MoreVertical className="w-5 h-5" />}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={cn(
            'absolute z-10 mt-2 w-48 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black/5 focus:outline-none',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          <div className="py-1">
            {items.map((item, index) => {
              const Icon = item.icon;
              return (
                <Menu.Item key={index} disabled={item.disabled}>
                  {({ active }: { active: boolean }) => (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        item.onClick();
                      }}
                      disabled={item.disabled}
                      className={cn(
                        'flex w-full items-center gap-2 px-4 py-2 text-sm',
                        active && 'bg-gray-50',
                        item.variant === 'danger'
                          ? 'text-red-600'
                          : 'text-gray-700',
                        item.disabled && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      {Icon && <Icon className="w-4 h-4" />}
                      {item.label}
                    </button>
                  )}
                </Menu.Item>
              );
            })}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
