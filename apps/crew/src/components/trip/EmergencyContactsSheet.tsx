"use client";

/**
 * EmergencyContactsSheet Component
 *
 * Bottom sheet displaying emergency contacts for quick access:
 * - Institution coordinator (direct call)
 * - Institution phone
 * - Local emergency numbers (123 Colombia / 911 Ecuador)
 */

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  Phone,
  Building2,
  Shield,
  User,
  X,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EmergencyContact {
  type: "coordinator" | "institution" | "emergency";
  name: string;
  role?: string;
  phone: string;
  isPrimary?: boolean;
}

interface EmergencyContactsSheetProps {
  /** Whether the sheet is open */
  isOpen: boolean;
  /** Handler to close the sheet */
  onClose: () => void;
  /** Institution name */
  institutionName?: string;
  /** List of contacts */
  contacts: EmergencyContact[];
  /** Country code for local emergency numbers */
  countryCode?: "EC" | "CO";
}

// Emergency numbers by country
const EMERGENCY_NUMBERS = {
  EC: [
    { name: "Emergencias", number: "911", description: "Policía, Bomberos, Ambulancia" },
  ],
  CO: [
    { name: "Emergencias", number: "123", description: "Línea Nacional de Emergencias" },
    { name: "Cruz Roja", number: "132", description: "Ambulancia" },
  ],
};

const contactIcons = {
  coordinator: User,
  institution: Building2,
  emergency: Shield,
};

const contactColors = {
  coordinator: "bg-primary/10 text-primary",
  institution: "bg-blue-100 text-blue-700",
  emergency: "bg-error/10 text-error",
};

export function EmergencyContactsSheet({
  isOpen,
  onClose,
  institutionName,
  contacts,
  countryCode = "EC",
}: EmergencyContactsSheetProps) {
  const emergencyNumbers = EMERGENCY_NUMBERS[countryCode];

  const handleCall = (phone: string) => {
    // Clean phone number
    const cleanPhone = phone.replace(/[^0-9+]/g, "");
    window.location.href = `tel:${cleanPhone}`;
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        {/* Sheet */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="translate-y-full"
              enterTo="translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="translate-y-0"
              leaveTo="translate-y-full"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-t-2xl bg-white shadow-xl transition-all">
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-2">
                  <div className="w-10 h-1 bg-gray-300 rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-200">
                  <div>
                    <Dialog.Title className="text-lg font-bold text-gray-900">
                      Contactos de Emergencia
                    </Dialog.Title>
                    {institutionName && (
                      <p className="text-sm text-gray-500">{institutionName}</p>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Contacts List */}
                <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
                  {/* Institution Contacts */}
                  {contacts.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Institución
                      </h3>
                      {contacts.map((contact, index) => {
                        const Icon = contactIcons[contact.type];
                        const colorClass = contactColors[contact.type];

                        return (
                          <button
                            key={index}
                            onClick={() => handleCall(contact.phone)}
                            className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                          >
                            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", colorClass)}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 text-left">
                              <p className="font-medium text-gray-900">{contact.name}</p>
                              {contact.role && (
                                <p className="text-xs text-gray-500">{contact.role}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">{contact.phone}</span>
                              <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                                <Phone className="w-4 h-4 text-success" />
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Emergency Numbers */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Emergencias Locales
                    </h3>
                    {emergencyNumbers.map((emergency, index) => (
                      <button
                        key={index}
                        onClick={() => handleCall(emergency.number)}
                        className="w-full flex items-center gap-3 p-3 bg-error/5 hover:bg-error/10 rounded-xl transition-colors border border-error/20"
                      >
                        <div className="w-10 h-10 bg-error/10 rounded-full flex items-center justify-center">
                          <Shield className="w-5 h-5 text-error" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-gray-900">{emergency.name}</p>
                          <p className="text-xs text-gray-500">{emergency.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-error">{emergency.number}</span>
                          <div className="w-8 h-8 bg-error/10 rounded-full flex items-center justify-center">
                            <Phone className="w-4 h-4 text-error" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Note */}
                  <p className="text-xs text-center text-gray-400 pt-2">
                    Toca un contacto para llamar directamente
                  </p>
                </div>

                {/* Safe Area Padding */}
                <div className="h-6 bg-white" />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
