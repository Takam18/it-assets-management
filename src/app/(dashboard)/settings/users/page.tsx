import { getUsers, createUser, updateUser, deleteUser } from '@/actions/users'
import { PageHeader, StatusBadge } from '@/components/ui'
import { revalidatePath } from 'next/cache'
import { NewUserModal } from './NewUserModal'
import { UserEditModal } from './UserEditModal'
import { TrashIcon } from '@heroicons/react/24/outline'

export default async function AdminUsersPage() {
  const users = await getUsers()

  async function handleCreateUser(formData: FormData) {
    'use server'
    await createUser(formData)
  }

  async function handleUpdateUser(formData: FormData) {
    'use server'
    await updateUser(formData)
  }

  async function handleDeleteUser(formData: FormData) {
    'use server'
    const id = parseInt(formData.get('id') as string)
    await deleteUser(id)
  }

  return (
    <div>
      <PageHeader 
        title="User Management" 
        subtitle="Manage user access and privileges" 
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Settings', href: '#' },
          { label: 'Users' }
        ]}
        actions={<NewUserModal createAction={handleCreateUser} />}
      />

      <div className="glass-card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>NTID</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td><strong>{user.name || '—'}</strong></td>
                  <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{user.ntid || '—'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{user.email}</td>
                  <td>
                    <StatusBadge status={user.role === 'ADMIN' ? 'Assigned' : 'In Stock'} />
                    <span style={{ marginLeft: '8px', fontFamily: 'monospace', fontSize: '0.8rem' }}>{user.role}</span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <UserEditModal user={user} updateAction={handleUpdateUser} />
                      <form action={handleDeleteUser}>
                        <input type="hidden" name="id" value={user.id} />
                        <button type="submit" className="btn btn-danger btn-sm" title="Delete User">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

