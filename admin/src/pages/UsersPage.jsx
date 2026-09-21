import { useState } from 'react';
import { KeyRound, Pencil, Plus, ShieldCheck } from 'lucide-react';
import { ROLES, ROLE_LABELS } from '../config/constants';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useAsync } from '../hooks/useAsync';
import { requestPasswordReset } from '../services/authService';
import { approveAccessRequest, createStaffUser, listAccessRequests, listUsers, rejectAccessRequest, updateStaffUser } from '../services/userService';
import Button, { IconButton } from '../components/ui/Button';
import { Card, PageHeader } from '../components/ui/DataDisplay';
import DataTable from '../components/ui/DataTable';
import { SelectField, TextField, Toggle } from '../components/ui/FormField';
import Modal from '../components/ui/Modal';
import { Badge } from '../components/ui/Badges';
import { EmptyState } from '../components/ui/States';
import { getErrorMessage, logError } from '../utils/errors';
import { hasErrors, v } from '../utils/validators';

function UserForm({ target, onClose, onSaved }) {
  const { user, profile } = useAuth();
  const toast = useToast();
  const isSelf = target?.id === user.uid;
  const [values, setValues] = useState(target ? { name: target.name || '', email: target.email || '', password: '', role: target.role, active: !!target.active } : { name: '', email: '', password: '', role: ROLES.AYURVEDA, active: true });
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const errors = {
    name: v.text(values.name, { label: 'Name', min: 2, max: 100, required: true }),
    email: target ? '' : v.email(values.email, { required: true }),
    password: target ? '' : values.password.length < 8 ? 'Password must be at least 8 characters.' : '',
    role: v.select(values.role, 'Role'),
  };
  const bind = (k) => ({ value: values[k], onChange: (e) => setValues((s) => ({ ...s, [k]: e.target.value })), error: submitted ? errors[k] : '' });

  const save = async (e) => {
    e.preventDefault();
    if (busy) return;
    setSubmitted(true);
    if (hasErrors(errors)) return;
    setBusy(true);
    try {
      if (target) {
        await updateStaffUser(target.id, values, user);
        toast.success('User updated.');
      } else {
        await createStaffUser(values, user);
        toast.success('User created. Share the temporary password securely and ask them to change it.');
      }
      onSaved();
    } catch (err) {
      logError('user-save', err);
      toast.error(getErrorMessage(err, 'Could not save the user.'));
      setBusy(false);
    }
  };

  return (
    <Modal open onClose={busy ? () => {} : onClose} dismissible={!busy} title={target ? 'Edit user' : 'Add user'}
      footer={<><Button variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button><Button type="submit" form="user-form" loading={busy}>{target ? 'Save changes' : 'Create user'}</Button></>}>
      <form id="user-form" onSubmit={save} noValidate className="space-y-5">
        <TextField label="Full name" required {...bind('name')} />
        <TextField label="Email" type="email" required disabled={!!target} autoComplete="off" {...bind('email')} />
        {!target && <TextField label="Temporary password" type="password" required autoComplete="new-password" hint="At least 8 characters. Ask the user to reset it after first sign-in." {...bind('password')} />}
        <SelectField label="Role" required disabled={isSelf} hint={isSelf ? 'You can’t change your own role.' : undefined} value={values.role} onChange={(e) => setValues((s) => ({ ...s, role: e.target.value }))}>
          {Object.entries(ROLE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </SelectField>
        {target && <Toggle label="Active" description={isSelf ? 'You can’t deactivate your own account.' : 'Inactive users can no longer use the admin panel.'} checked={values.active} disabled={isSelf} onChange={(val) => setValues((s) => ({ ...s, active: val }))} />}
        <p className="rounded-md bg-ink-50 p-3 text-xs text-ink-600">
          <strong>{ROLE_LABELS[values.role]}:</strong>{' '}
          {values.role === ROLES.SUPER ? 'Full access to both practices, the store, reports, users and settings.' : values.role === ROLES.AYURVEDA ? 'Ayurveda practice data, website content, and the whole store (products, inventory, orders).' : 'Dental practice data and website content only. No store access.'}
        </p>
        {profile && target && target.id !== user.uid && <p className="text-xs text-ink-500">Role changes take effect immediately.</p>}
      </form>
    </Modal>
  );
}

/** Pending self-signups. Approving creates the users/{uid} profile with the chosen role. */
function AccessRequests({ onApproved }) {
  const { user } = useAuth();
  const toast = useToast();
  const q = useAsync(listAccessRequests, []);
  const [roles, setRoles] = useState({});
  const [busyId, setBusyId] = useState(null);

  if (q.loading || q.error || !q.data?.length) return q.error ? <p className="mb-6 text-sm text-danger-700">{q.error}</p> : null;

  const act = async (r, fn, message) => {
    setBusyId(r.id);
    try {
      await fn();
      toast.success(message);
      q.reload();
      onApproved();
    } catch (err) {
      logError('access-request', err);
      toast.error(getErrorMessage(err, 'Could not update the request.'));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Card title={`Access requests (${q.data.length})`} description="People who signed up and are waiting for a role." className="mb-6" padded={false}>
      <ul className="divide-y divide-ink-100">
        {q.data.map((r) => {
          const role = roles[r.id] || ROLES.AYURVEDA;
          return (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
              <div className="min-w-0"><p className="font-medium text-ink-900">{r.name}</p><p className="text-xs text-ink-500">{r.email}</p></div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="sr-only" htmlFor={`role-${r.id}`}>Role for {r.name}</label>
                <select id={`role-${r.id}`} value={role} onChange={(e) => setRoles((s) => ({ ...s, [r.id]: e.target.value }))} className="h-9 rounded-md border border-ink-300 bg-white px-2 text-sm">
                  {Object.entries(ROLE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <Button size="sm" loading={busyId === r.id} disabled={busyId !== null} onClick={() => act(r, () => approveAccessRequest(r, role, user), `${r.name} approved as ${ROLE_LABELS[role]}.`)}>Approve</Button>
                <Button size="sm" variant="dangerOutline" disabled={busyId !== null} onClick={() => act(r, () => rejectAccessRequest(r.id), 'Request rejected.')}>Reject</Button>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

export default function UsersPage() {
  const { user } = useAuth();
  const toast = useToast();
  const q = useAsync(listUsers, []);
  const [editing, setEditing] = useState(null);

  const sendReset = async (u) => {
    try {
      await requestPasswordReset(u.email);
      toast.success(`Password reset email sent to ${u.email}.`);
    } catch (err) {
      logError('reset', err);
      toast.error(getErrorMessage(err, 'Could not send the reset email.'));
    }
  };

  const columns = [
    { key: 'name', header: 'User', render: (u) => <div><p className="font-medium text-ink-900">{u.name || '—'}{u.id === user.uid && <span className="ml-2 text-xs font-normal text-ink-500">(you)</span>}</p><p className="text-xs text-ink-500">{u.email}</p></div> },
    { key: 'role', header: 'Role', render: (u) => <Badge tone={u.role === ROLES.SUPER ? 'amber' : u.role === ROLES.DENTAL ? 'blue' : 'green'}>{ROLE_LABELS[u.role] || u.role}</Badge> },
    { key: 'status', header: 'Status', render: (u) => <Badge tone={u.active ? 'green' : 'neutral'}>{u.active ? 'Active' : 'Inactive'}</Badge> },
    { key: 'actions', header: <span className="sr-only">Actions</span>, className: 'text-right whitespace-nowrap', render: (u) => (
      <>
        <IconButton label={`Send password reset to ${u.email}`} onClick={() => sendReset(u)}><KeyRound className="size-4" /></IconButton>
        <IconButton label={`Edit ${u.name || u.email}`} onClick={() => setEditing(u)}><Pencil className="size-4" /></IconButton>
      </>) },
  ];

  return (
    <>
      <PageHeader title="Users / Roles" description="Staff who can sign in to this admin panel. Roles are enforced by the database security rules."
        actions={<Button onClick={() => setEditing('new')}><Plus className="size-4" aria-hidden="true" /> Add user</Button>} />
      <AccessRequests onApproved={q.reload} />
      <Card padded={false}>
        <DataTable caption="Users" columns={columns} rows={q.data || []} loading={q.loading} error={q.error} onRetry={q.reload}
          empty={<EmptyState icon={ShieldCheck} title="No users found" />} />
      </Card>
      <p className="mt-3 text-xs text-ink-500">Accounts can’t be deleted from here — set a user to inactive to remove their access while keeping the audit trail.</p>
      {editing && <UserForm target={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); q.reload(); }} />}
    </>
  );
}
