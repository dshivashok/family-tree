import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

function buildTree(members, parentId = null) {
  return members
    .filter(m => m.parent_id === parentId)
    .map(m => ({ ...m, children: buildTree(members, m.id) }));
}

function Tree({ nodes, membersById, onAddChild, onAddSpouse }) {
  if (!nodes || nodes.length === 0) return null;
  return (
    <ul className="tree">
      {nodes.map(n => {
        const spouse = n.spouse_id ? membersById[n.spouse_id] : null;
        return (
          <li key={n.id}>
            <div className="node">
              {n.picture_url && (
                <img
                  className="avatar"
                  src={supabase.storage.from('pictures').getPublicUrl(n.picture_url).data.publicUrl}
                  alt={n.name}
                />
              )}
              <div className="info">
                <div className="name">{n.name} {n.chinese_name && `(${n.chinese_name})`}</div>
                {spouse && <div className="spouse">Spouse: {spouse.name}</div>}
                {n.phone && <div className="contact">{n.phone}</div>}
                {n.email && <div className="contact">{n.email}</div>}
                <div className="actions">
                  <button className="btn" onClick={() => onAddChild(n.id)}>Add Child</button>
                  <button className="btn secondary" onClick={() => onAddSpouse(n.id)} disabled={!!spouse}>Add Spouse</button>
                </div>
              </div>
            </div>
            <Tree
              nodes={n.children}
              membersById={membersById}
              onAddChild={onAddChild}
              onAddSpouse={onAddSpouse}
            />
          </li>
        );
      })}
    </ul>
  );
}

function MemberForm({ parentId, spouseId, onSaved, onClose, referenceMember }) {
  const [name, setName] = useState('');
  const [chineseName, setChineseName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [picture, setPicture] = useState(null);
  const isSpouse = !!spouseId;

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
    const { data: insertData, error } = await supabase
      .from('family_members')
      .insert({
        name,
        chinese_name: chineseName,
        phone,
        email,
        parent_id: parentId || null,
        spouse_id: spouseId || null,
        picture_url,
      })
      .select()
      .single();
    if (error) {
      alert('Error saving member');
      return;
    }
    if (spouseId) {
      await supabase
        .from('family_members')
        .update({ spouse_id: insertData.id })
        .eq('id', spouseId);
    }
    onSaved();
  };

  return (
    <div className="overlay">
      <form className="form" onSubmit={handleSubmit}>
        <h2>{isSpouse ? `Add Spouse for ${referenceMember?.name}` : parentId ? `Add Child to ${referenceMember?.name}` : 'Add Family Member'}</h2>
        <label>
          Name
          <input value={name} onChange={e => setName(e.target.value)} required />
        </label>
        <label>
          Chinese Name
          <input value={chineseName} onChange={e => setChineseName(e.target.value)} />
        </label>
        <label>
          Phone
          <input value={phone} onChange={e => setPhone(e.target.value)} />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
        </label>
        <label>
          Picture
          <input type="file" accept="image/*" onChange={e => setPicture(e.target.files[0])} />
        </label>
          <div className="formActions">
            <button className="btn" type="submit">Save</button>
            <button className="btn secondary" type="button" onClick={onClose}>Cancel</button>
          </div>
      </form>
    </div>
  );
}

export default function Home() {
  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [parentId, setParentId] = useState(null);
  const [spouseId, setSpouseId] = useState(null);

  const fetchMembers = async () => {
    const { data } = await supabase.from('family_members').select('*');
    setMembers(data || []);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const openForm = (pId = null, sId = null) => {
    setParentId(pId);
    setSpouseId(sId);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
  };

  const membersById = Object.fromEntries(members.map(m => [m.id, m]));
  const tree = buildTree(members);

  return (
    <div className="container">
        <h1>Family Tree</h1>
        <button className="btn addRoot" onClick={() => openForm()}>Add Root Member</button>
      <Tree
        nodes={tree}
        membersById={membersById}
        onAddChild={(id) => openForm(id, null)}
        onAddSpouse={(id) => openForm(null, id)}
      />
      {showForm && (
        <MemberForm
          parentId={parentId}
          spouseId={spouseId}
          referenceMember={membersById[parentId || spouseId]}
          onSaved={() => {
            closeForm();
            fetchMembers();
          }}
          onClose={closeForm}
        />
      )}
        <style jsx>{`
          .container {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f7fa;
            min-height: 100vh;
            max-width: 900px;
            margin: 0 auto;
            padding: 30px 20px;
            font-size: 1.1rem;
          }
          h1 {
            text-align: center;
            margin-bottom: 30px;
          }
          .tree {
            list-style: none;
            padding-left: 0;
          }
          .tree li {
            margin-left: 20px;
            position: relative;
          }
          .tree li::before {
            content: '';
            position: absolute;
            left: -10px;
            top: 0;
            bottom: 0;
            border-left: 2px solid #d0d7de;
          }
          .tree li:first-child::before {
            top: 1.2rem;
          }
          .node {
            background: #fff;
            border-radius: 12px;
            padding: 15px;
            margin: 15px 0;
            display: flex;
            gap: 15px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          }
          .avatar {
            width: 70px;
            height: 70px;
            object-fit: cover;
            border-radius: 50%;
            border: 2px solid #e0e0e0;
          }
          .info {
            flex: 1;
          }
          .name {
            font-weight: bold;
            margin-bottom: 6px;
            font-size: 1.2rem;
          }
          .contact {
            color: #555;
          }
          .actions {
            margin-top: 10px;
          }
          .btn {
            background: #1976d2;
            color: #fff;
            border: none;
            border-radius: 6px;
            padding: 8px 16px;
            margin-right: 8px;
            font-size: 1rem;
            cursor: pointer;
            transition: background 0.2s;
          }
          .addRoot {
            display: block;
            margin: 0 auto 20px;
          }
          .btn:hover {
            background: #125ea2;
          }
          .btn.secondary {
            background: #6c757d;
          }
          .btn.secondary:hover {
            background: #565e64;
          }
          .btn:disabled {
            background: #ccc;
            cursor: not-allowed;
          }
          .overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .form {
            background: #fff;
            padding: 25px;
            border-radius: 12px;
            width: 90%;
            max-width: 420px;
            font-size: 1.1rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .form label {
            display: block;
            margin-bottom: 14px;
          }
          .form input[type="text"],
          .form input[type="email"],
          .form input[type="file"] {
            width: 100%;
            font-size: 1.1rem;
            padding: 10px;
            box-sizing: border-box;
            border: 1px solid #ccc;
            border-radius: 6px;
          }
          .formActions {
            text-align: right;
            margin-top: 15px;
          }
        `}</style>
    </div>
  );
}
