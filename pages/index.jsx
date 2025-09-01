import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const inputStyle = {
  fontSize: '1rem',
  padding: '8px',
  width: '100%',
  boxSizing: 'border-box',
};

const labelStyle = {
  fontSize: '1.1rem',
  display: 'block',
  marginBottom: '4px',
};

const buttonStyle = {
  fontSize: '1rem',
  padding: '10px 20px',
};

function buildTree(members, parentId = null) {
  return members
    .filter(m => m.parent_id === parentId)
    .map(m => ({ ...m, children: buildTree(members, m.id) }));
}

function Tree({ nodes }) {
  if (!nodes || nodes.length === 0) return null;
  return (
    <ul>
      {nodes.map(n => (
        <li key={n.id}>
          {n.picture_url && (
            <img
              src={supabase.storage.from('pictures').getPublicUrl(n.picture_url).data.publicUrl}
              alt={n.name}
              width={50}
            />
          )}
          <div>
            {n.name} {n.chinese_name && `(${n.chinese_name})`} {n.phone && `- ${n.phone}`} {n.email && `- ${n.email}`}
          </div>
          <Tree nodes={n.children} />
        </li>
      ))}
    </ul>
  );
}

export default function Home() {
  const [members, setMembers] = useState([]);
  const [name, setName] = useState('');
  const [chineseName, setChineseName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [parentId, setParentId] = useState('');
  const [picture, setPicture] = useState(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    const { data } = await supabase.from('family_members').select('*');
    setMembers(data || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let picture_url = null;
    if (picture) {
      const fileName = `${Date.now()}-${picture.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pictures')
        .upload(fileName, picture);
      if (uploadError) {
        alert('Picture upload failed');
        return;
      }
      picture_url = uploadData.path;
    }
    const { error } = await supabase.from('family_members').insert({
      name,
      chinese_name: chineseName,
      phone,
      email,
      parent_id: parentId || null,
      picture_url,
    });
    if (error) {
      alert('Error saving member');
    } else {
      setName('');
      setChineseName('');
      setPhone('');
      setEmail('');
      setParentId('');
      setPicture(null);
      fetchMembers();
    }
  };

  const tree = buildTree(members);

  return (
    <div style={{ padding: 20, fontSize: '1.1rem' }}>
      <h1>Family Tree</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: 40, maxWidth: 400 }}>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>
            Name:
            <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} required />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>
            Chinese Name:
            <input style={inputStyle} value={chineseName} onChange={e => setChineseName(e.target.value)} />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>
            Phone:
            <input style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>
            Email:
            <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>
            Parent:
            <select style={inputStyle} value={parentId} onChange={e => setParentId(e.target.value)}>
              <option value="">None</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>
            Picture:
            <input style={inputStyle} type="file" accept="image/*" onChange={e => setPicture(e.target.files[0])} />
          </label>
        </div>
        <button style={buttonStyle} type="submit">Add Member</button>
      </form>
      <Tree nodes={tree} />
    </div>
  );
}

