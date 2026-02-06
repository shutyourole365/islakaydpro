import { useState, useMemo } from 'react';
import {
  Heart,
  Plus,
  Folder,
  FolderPlus,
  Edit2,
  Trash2,
  MoreVertical,
  X,
  Check,
  Share2,
  Lock,
  Globe,
  Image,
  Package,
  Star,
  ChevronRight,
  Search,
  Grid3X3,
  List,
} from 'lucide-react';

interface Equipment {
  id: string;
  title: string;
  daily_rate: number;
  image_url: string;
  rating: number;
  location: string;
}

interface WishlistCollection {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  items: Equipment[];
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface WishlistCollectionsProps {
  collections?: WishlistCollection[];
  allFavorites?: Equipment[];
  onCreateCollection: (name: string, description?: string, isPrivate?: boolean) => Promise<void>;
  onDeleteCollection: (id: string) => Promise<void>;
  onUpdateCollection: (id: string, data: Partial<WishlistCollection>) => Promise<void>;
  onAddToCollection: (collectionId: string, equipmentId: string) => Promise<void>;
  onRemoveFromCollection: (collectionId: string, equipmentId: string) => Promise<void>;
  onEquipmentClick: (equipment: Equipment) => void;
  className?: string;
}

const demoCollections: WishlistCollection[] = [
  {
    id: 'c1',
    name: 'Construction Project',
    description: 'Equipment for the summer construction site',
    items: [
      { id: 'e1', title: 'CAT 320 Excavator', daily_rate: 450, image_url: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400', rating: 4.9, location: 'San Francisco, CA' },
      { id: 'e2', title: 'Bobcat S650 Skid Steer', daily_rate: 275, image_url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400', rating: 4.7, location: 'Oakland, CA' },
    ],
    isPrivate: false,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'c2',
    name: 'Landscaping Tools',
    description: 'For the backyard renovation',
    items: [
      { id: 'e3', title: 'Mini Excavator', daily_rate: 195, image_url: 'https://images.unsplash.com/photo-1580256081112-e49377338b7f?w=400', rating: 4.8, location: 'San Jose, CA' },
    ],
    isPrivate: true,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
];

export default function WishlistCollections({
  collections = demoCollections,
  allFavorites = [],
  onCreateCollection,
  onDeleteCollection,
  onUpdateCollection,
  onAddToCollection,
  onRemoveFromCollection,
  onEquipmentClick,
  className = '',
}: WishlistCollectionsProps) {
  const [selectedCollection, setSelectedCollection] = useState<WishlistCollection | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<WishlistCollection | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  // New collection form state
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newIsPrivate, setNewIsPrivate] = useState(false);

  const filteredCollections = useMemo(() => {
    if (!searchQuery) return collections;
    const query = searchQuery.toLowerCase();
    return collections.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query)
    );
  }, [collections, searchQuery]);

  const handleCreateCollection = async () => {
    if (!newName.trim()) return;
    await onCreateCollection(newName, newDescription, newIsPrivate);
    setShowCreateModal(false);
    setNewName('');
    setNewDescription('');
    setNewIsPrivate(false);
  };

  const handleEditCollection = async () => {
    if (!editingCollection || !newName.trim()) return;
    await onUpdateCollection(editingCollection.id, {
      name: newName,
      description: newDescription,
      isPrivate: newIsPrivate,
    });
    setShowEditModal(false);
    setEditingCollection(null);
  };

  const openEditModal = (collection: WishlistCollection) => {
    setEditingCollection(collection);
    setNewName(collection.name);
    setNewDescription(collection.description || '');
    setNewIsPrivate(collection.isPrivate);
    setShowEditModal(true);
    setMenuOpen(null);
  };

  const handleDeleteCollection = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this collection?')) {
      await onDeleteCollection(id);
    }
    setMenuOpen(null);
  };

  const shareCollection = (collection: WishlistCollection) => {
    const url = `${window.location.origin}/wishlist/${collection.id}`;
    navigator.clipboard.writeText(url);
    alert('Collection link copied to clipboard!');
    setMenuOpen(null);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-red-600 fill-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedCollection ? selectedCollection.name : 'My Collections'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedCollection
                  ? `${selectedCollection.items.length} items`
                  : `${collections.length} collections • ${allFavorites.length} total items`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedCollection ? (
              <button
                onClick={() => setSelectedCollection(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Back to Collections
              </button>
            ) : (
              <>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  <FolderPlus className="w-5 h-5" />
                  New Collection
                </button>
              </>
            )}
          </div>
        </div>

        {/* Search and View Toggle */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={selectedCollection ? 'Search items...' : 'Search collections...'}
              className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-600 shadow'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Grid3X3 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-600 shadow'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <List className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-h-[600px] overflow-y-auto">
        {!selectedCollection ? (
          /* Collections Grid */
          filteredCollections.length === 0 ? (
            <div className="text-center py-12">
              <Folder className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchQuery ? 'No collections found' : 'No collections yet'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchQuery
                  ? 'Try a different search term'
                  : 'Create a collection to organize your favorites'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  <Plus className="w-5 h-5" />
                  Create First Collection
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredCollections.map((collection) => (
                <div
                  key={collection.id}
                  className="group relative bg-gray-50 dark:bg-gray-700/50 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedCollection(collection)}
                >
                  {/* Cover Image Grid */}
                  <div className="aspect-square relative">
                    {collection.items.length > 0 ? (
                      <div className="grid grid-cols-2 gap-0.5 h-full">
                        {collection.items.slice(0, 4).map((item, i) => (
                          <div
                            key={item.id}
                            className={`bg-gray-200 dark:bg-gray-600 ${
                              collection.items.length === 1 ? 'col-span-2 row-span-2' :
                              collection.items.length === 2 ? 'row-span-2' :
                              collection.items.length === 3 && i === 0 ? 'row-span-2' : ''
                            }`}
                          >
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {collection.items.length < 4 && collection.items.length !== 1 && collection.items.length !== 2 && (
                          [...Array(4 - collection.items.length)].map((_, i) => (
                            <div key={`empty-${i}`} className="bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                              <Image className="w-8 h-8 text-gray-400" />
                            </div>
                          ))
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                        <Folder className="w-16 h-16 text-gray-400" />
                      </div>
                    )}

                    {/* Privacy Badge */}
                    {collection.isPrivate && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 rounded-full flex items-center gap-1">
                        <Lock className="w-3 h-3 text-white" />
                        <span className="text-xs text-white">Private</span>
                      </div>
                    )}

                    {/* Menu Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(menuOpen === collection.id ? null : collection.id);
                      }}
                      className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="w-4 h-4 text-white" />
                    </button>

                    {/* Dropdown Menu */}
                    {menuOpen === collection.id && (
                      <div
                        className="absolute top-12 right-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-10 min-w-[140px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => openEditModal(collection)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        {!collection.isPrivate && (
                          <button
                            onClick={() => shareCollection(collection)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <Share2 className="w-4 h-4" />
                            Share
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteCollection(collection.id)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Collection Info */}
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {collection.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {collection.items.length} items
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-3">
              {filteredCollections.map((collection) => (
                <div
                  key={collection.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setSelectedCollection(collection)}
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    {collection.items.length > 0 ? (
                      <img
                        src={collection.items[0].image_url}
                        alt={collection.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                        <Folder className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {collection.name}
                      </h3>
                      {collection.isPrivate && (
                        <Lock className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {collection.description || `${collection.items.length} items`}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              ))}
            </div>
          )
        ) : (
          /* Collection Items */
          selectedCollection.items.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No items in this collection
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Browse equipment and add favorites to this collection
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {selectedCollection.items.map((item) => (
                <div
                  key={item.id}
                  className="group bg-gray-50 dark:bg-gray-700/50 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => onEquipmentClick(item)}
                >
                  <div className="aspect-square relative">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFromCollection(selectedCollection.id, item.id);
                      }}
                      className="absolute top-2 right-2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    >
                      <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                    </button>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-emerald-600 font-bold">${item.daily_rate}/day</span>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        {item.rating}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {selectedCollection.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => onEquipmentClick(item)}
                >
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.location}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-emerald-600 font-bold">${item.daily_rate}/day</span>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        {item.rating}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFromCollection(selectedCollection.id, item.id);
                    }}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
                  >
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {showCreateModal ? 'Create Collection' : 'Edit Collection'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setEditingCollection(null);
                }}
                className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Construction Equipment"
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="What is this collection for?"
                  rows={3}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {newIsPrivate ? (
                    <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {newIsPrivate ? 'Private' : 'Public'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {newIsPrivate ? 'Only you can see this' : 'Anyone with the link can view'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setNewIsPrivate(!newIsPrivate)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    newIsPrivate ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                      newIsPrivate ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                }}
                className="flex-1 py-2 border dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={showCreateModal ? handleCreateCollection : handleEditCollection}
                disabled={!newName.trim()}
                className="flex-1 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                {showCreateModal ? 'Create' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
