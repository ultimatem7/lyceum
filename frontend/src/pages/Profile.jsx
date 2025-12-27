import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import API from '../utils/api';
import PostCard from '../components/PostCard';
import EssayCard from '../components/EssayCard';

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [essays, setEssays] = useState([]);
  const [comments, setComments] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ bio: '', location: '', interests: '' });

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, statsRes] = await Promise.all([
          API.get(`/profile/${username}`),
          API.get(`/profile/${username}/stats`)
        ]);

        setProfile(profileRes.data.user);
        setPosts(profileRes.data.posts);
        setEssays(profileRes.data.essays);
        setComments(profileRes.data.comments);
        setStats(statsRes.data);
        setEditData({
          bio: profileRes.data.user.bio || '',
          location: profileRes.data.user.location || '',
          interests: profileRes.data.user.interests?.join(', ') || ''
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  const handleSaveProfile = async () => {
    try {
      const interests = editData.interests
        .split(',')
        .map(i => i.trim())
        .filter(i => i);

      const { data } = await API.put('/profile/update', {
        bio: editData.bio,
        location: editData.location,
        interests
      });

      setProfile(data);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-navy border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-2xl font-serif italic text-navy">User not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="greek-card p-8 mb-8">
        <div className="flex items-start space-x-6">
          {/* Profile Picture */}
          <div className="w-32 h-32 rounded-full border-4 border-navy bg-cream flex items-center justify-center overflow-hidden">
            {profile.profilePicture ? (
              <img src={profile.profilePicture} alt={profile.username} className="w-full h-full object-cover" />
            ) : (
              <span className="text-5xl font-serif italic text-navy">
                {profile.username[0].toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-4xl font-serif italic text-navy">{profile.username}</h1>
              {isOwnProfile && !editing && (
                <div className="flex space-x-3">
                  <button onClick={() => setEditing(true)} className="greek-button-outline">
                    Edit Profile
                  </button>
                  <button 
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to delete your account? This action cannot be undone and will delete all your posts, essays, and comments.')) {
                        try {
                          await API.delete('/profile/delete-account');
                          localStorage.removeItem('token');
                          window.location.href = '/';
                        } catch (error) {
                          console.error('Error deleting account:', error);
                          alert('Failed to delete account. Please try again.');
                        }
                      }
                    }}
                    className="greek-button-outline border-red-500 text-red-500 hover:bg-red-500 hover:text-cream"
                  >
                    Delete Account
                  </button>
                </div>
              )}
            </div>

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-navy font-serif italic mb-2">Bio</label>
                  <textarea
                    value={editData.bio}
                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    className="greek-input w-full"
                    rows={3}
                    maxLength={500}
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-navy font-serif italic mb-2">Location</label>
                    <input
                      type="text"
                      value={editData.location}
                      onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                      className="greek-input w-full"
                      placeholder="Athens, Greece"
                    />
                  </div>
                  <div>
                    <label className="block text-navy font-serif italic mb-2">Interests</label>
                    <input
                      type="text"
                      value={editData.interests}
                      onChange={(e) => setEditData({ ...editData, interests: e.target.value })}
                      className="greek-input w-full"
                      placeholder="Ethics, Metaphysics..."
                    />
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button onClick={handleSaveProfile} className="greek-button">
                    Save Changes
                  </button>
                  <button onClick={() => setEditing(false)} className="greek-button-outline">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-navy/80 text-lg mb-4">{profile.bio || 'No bio yet.'}</p>
                <div className="flex items-center space-x-4 text-navy/60 mb-4">
                  {profile.location && (
                    <>
                      <span>📍 {profile.location}</span>
                      <span>•</span>
                    </>
                  )}
                  <span>Joined {new Date(profile.joinedAt).toLocaleDateString()}</span>
                </div>
                {profile.interests && profile.interests.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest, idx) => (
                      <span key={idx} className="px-3 py-1 border-2 border-navy text-sm font-serif italic">
                        {interest}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="greek-card p-4 text-center">
          <div className="text-3xl font-serif italic text-navy mb-1">{profile.postsCount}</div>
          <div className="text-navy/60 text-sm">Posts</div>
        </div>
        <div className="greek-card p-4 text-center">
          <div className="text-3xl font-serif italic text-navy mb-1">{profile.essaysCount}</div>
          <div className="text-navy/60 text-sm">Essays</div>
        </div>
        <div className="greek-card p-4 text-center">
          <div className="text-3xl font-serif italic text-navy mb-1">{profile.commentsCount}</div>
          <div className="text-navy/60 text-sm">Comments</div>
        </div>
        <div className="greek-card p-4 text-center">
          <div className="text-3xl font-serif italic text-navy mb-1">{stats?.totalViews || 0}</div>
          <div className="text-navy/60 text-sm">Total Views</div>
        </div>
        <div className="greek-card p-4 text-center">
          <div className="text-3xl font-serif italic text-navy mb-1">💡 {stats?.totalInsightful || stats?.totalUpvotes || 0}</div>
          <div className="text-navy/60 text-sm">Total Insightful</div>
        </div>
      </div>

      {/* Awards Section */}
      {profile.awards && profile.awards.length > 0 && (
        <div className="greek-card p-6 mb-8">
          <h2 className="text-2xl font-serif italic text-navy mb-4">Awards & Achievements</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {profile.awards.map((award, idx) => (
              <div key={idx} className="border-2 border-navy p-4 text-center">
                <div className="text-4xl mb-2">{award.icon || '🏆'}</div>
                <div className="font-serif italic text-navy">{award.name}</div>
                <div className="text-sm text-navy/60">{award.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-6 py-3 border-2 font-serif italic text-lg transition-all ${
            activeTab === 'posts' ? 'bg-navy text-cream border-navy' : 'border-navy hover:bg-stone'
          }`}
        >
          Posts ({posts.length})
        </button>
        <button
          onClick={() => setActiveTab('essays')}
          className={`px-6 py-3 border-2 font-serif italic text-lg transition-all ${
            activeTab === 'essays' ? 'bg-navy text-cream border-navy' : 'border-navy hover:bg-stone'
          }`}
        >
          Essays ({essays.length})
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`px-6 py-3 border-2 font-serif italic text-lg transition-all ${
            activeTab === 'comments' ? 'bg-navy text-cream border-navy' : 'border-navy hover:bg-stone'
          }`}
        >
          Comments ({comments.length})
        </button>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="greek-card p-12 text-center">
                <p className="text-navy/60 font-serif italic">No posts yet</p>
              </div>
            ) : (
              posts.map(post => <PostCard key={post._id} post={post} />)
            )}
          </div>
        )}

        {activeTab === 'essays' && (
          <div className="space-y-6">
            {essays.length === 0 ? (
              <div className="greek-card p-12 text-center">
                <p className="text-navy/60 font-serif italic">No essays yet</p>
              </div>
            ) : (
              essays.map(essay => <EssayCard key={essay._id} essay={essay} />)
            )}
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="greek-card p-12 text-center">
                <p className="text-navy/60 font-serif italic">No comments yet</p>
              </div>
            ) : (
              comments.map(comment => (
                <div key={comment._id} className="greek-card p-6">
                  <Link to={`/post/${comment.postId?._id}`} className="text-lg font-serif italic text-navy hover:underline mb-2 block">
                    On: {comment.postId?.title || 'Deleted post'}
                  </Link>
                  <p className="text-navy/80">{comment.content}</p>
                  <div className="text-sm text-navy/40 mt-2">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;