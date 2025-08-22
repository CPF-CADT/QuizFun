import React from "react";
import { KeyRound } from "lucide-react";
import { Card } from "../ui/Card";
import { InputField } from "../ui/InputField";
import { ActionButton } from "../ui/ActionButton";
import type { Passwords } from "../../pages/SettingsPage";

interface PasswordSettingsProps {
  passwords: Passwords;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangePassword: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const PasswordSettings: React.FC<PasswordSettingsProps> = ({
  passwords,
  onPasswordChange,
  onChangePassword,
}) => (
  <Card title="Change Password" icon={KeyRound}>
    <form
      onSubmit={onChangePassword}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
    >
      <InputField
        id="currentPassword"
        name="currentPassword"
        label="Current Password"
        type="password"
        value={passwords.currentPassword}
        onChange={onPasswordChange}
        icon={KeyRound}
      />
      <InputField
        id="newPassword"
        name="newPassword"
        label="New Password"
        type="password"
        value={passwords.newPassword}
        onChange={onPasswordChange}
        icon={KeyRound}
      />
      <InputField
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm New Password"
        type="password"
        value={passwords.confirmPassword}
        onChange={onPasswordChange}
        icon={KeyRound}
      />
      <div className="md:col-span-3 flex justify-end">
        <ActionButton type="submit">Update Password</ActionButton>
      </div>
    </form>
  </Card>
);
