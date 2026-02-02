import { useManageUsers, User } from "@/hooks/useManageUsers";
import { useUserRole } from "@/hooks/useUserRole";
import { Redirect } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function ManageUsers() {
  const { role, loading } = useUserRole();
  const { users = [], addUser, changeRole, removeUser } = useManageUsers();

  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "standard">("standard");
  
  // Modal pour demander le mot de passe admin
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>User Management</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (role !== "admin") return <Redirect href="/(tabs)/lighting" />;

  // Filtrage sécurisé
  const filteredUsers = users.filter(
    (user) =>
      (user.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (user.role ?? "").toLowerCase().includes(search.toLowerCase())
  );

  // Calculer les statistiques
  const adminCount = users.filter(u => u.role === "admin").length;
  const standardCount = users.filter(u => u.role === "standard").length;

  const handleChangeRole = async (user: User) => {
    Alert.alert(
      "Change Role",
      `Change ${user.name}'s role from ${user.role} to ${user.role === "admin" ? "standard" : "admin"}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            const updatedRole: "admin" | "standard" =
              user.role === "admin" ? "standard" : "admin";
            await changeRole(user.id, updatedRole);
          },
        },
      ]
    );
  };

  const handleRemoveUser = async (user: User) => {
    Alert.alert(
      "Delete User",
      `Are you sure you want to delete ${user.name ?? "this user"}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => removeUser(user.id) 
        },
      ]
    );
  };

  // Validation et demande du mot de passe admin
  const handleAddUserRequest = () => {
    if (!newName || !newEmail || !newPassword) {
      Alert.alert("Error", "Please fill all fields!");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      Alert.alert("Error", "Please enter a valid email");
      return;
    }

    // Fermer le modal d'ajout et ouvrir le modal de confirmation
    setModalVisible(false);
    setShowPasswordModal(true);
  };

  // Confirmation avec mot de passe admin
  const handleConfirmAddUser = async () => {
    if (!adminPassword) {
      Alert.alert("Error", "Please enter your admin password");
      return;
    }

    setShowPasswordModal(false);

    try {
      // Appeler addUser avec le mot de passe admin
      await addUser(newEmail, newPassword, newName, newRole, adminPassword);
      
      // Réinitialiser les champs
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      setNewRole("standard");
      setAdminPassword("");
      
      Alert.alert("Success", "User added successfully!");
    } catch (error: any) {
      console.error(error);
      
      let errorMessage = "Unable to add user.";
      
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email is already in use";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password too weak";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect admin password";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert("Error", errorMessage);
      
      // Réouvrir le modal d'ajout
      setModalVisible(true);
    } finally {
      setAdminPassword("");
    }
  };

  const handleCancelPasswordModal = () => {
    setShowPasswordModal(false);
    setAdminPassword("");
    // Réouvrir le modal d'ajout
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* ✅ HEADER - Style unifié */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>User Management</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        
        {/* ✅ STATISTICS CARD */}
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>System Overview</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{users.length}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#0EA5E9' }]}>{adminCount}</Text>
              <Text style={styles.statLabel}>Admins</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#16A34A' }]}>{standardCount}</Text>
              <Text style={styles.statLabel}>Standard</Text>
            </View>
          </View>
        </View>

        {/* ✅ SEARCH BAR - Style moderne */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Search users by name or role..."
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ✅ SECTION TITLE */}
        <Text style={styles.sectionTitle}>
          {search ? `Search Results (${filteredUsers.length})` : 'All Users'}
        </Text>

        {/* ✅ USERS LIST */}
        {filteredUsers.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyStateText}>
              {search ? 'No users found' : 'No users yet'}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {search ? 'Try a different search term' : 'Add your first user to get started'}
            </Text>
          </View>
        )}

        {filteredUsers.map((user, index) => (
          <View key={user.id} style={styles.userCard}>
            <View style={styles.userMainInfo}>
              <View style={[
                styles.userIconCircle,
                { backgroundColor: user.role === 'admin' ? '#DBEAFE' : '#DCFCE7' }
              ]}>
                <Text style={styles.userIcon}>
                  {user.role === 'admin' ? '👑' : '👤'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{user.name ?? "Unnamed"}</Text>
                <Text style={styles.userEmail}>{user.email ?? "No email"}</Text>
                <View style={[
                  styles.roleBadge,
                  { backgroundColor: user.role === 'admin' ? '#DBEAFE' : '#DCFCE7' }
                ]}>
                  <Text style={[
                    styles.roleBadgeText,
                    { color: user.role === 'admin' ? '#0369A1' : '#16A34A' }
                  ]}>
                    {user.role?.toUpperCase() ?? "UNKNOWN"}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.userActions}>
              <TouchableOpacity 
                onPress={() => handleChangeRole(user)}
                style={styles.roleButton}
              >
                <Text style={styles.roleButtonIcon}>🔄</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => handleRemoveUser(user)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonIcon}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* ✅ ADD USER BUTTON - Style moderne */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setNewName("");
          setNewEmail("");
          setNewPassword("");
          setNewRole("standard");
          setModalVisible(true);
        }}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {/* ✅ ADD USER MODAL - Style amélioré */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>➕ Add New User</Text>

            <View style={styles.modalForm}>
              {/* Name Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  placeholder="e.g. John Doe"
                  placeholderTextColor="#9CA3AF"
                  value={newName}
                  onChangeText={setNewName}
                  style={styles.modernInput}
                />
              </View>

              {/* Email Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  placeholder="e.g. john@example.com"
                  placeholderTextColor="#9CA3AF"
                  value={newEmail}
                  onChangeText={setNewEmail}
                  style={styles.modernInput}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  placeholder="Min. 6 characters"
                  placeholderTextColor="#9CA3AF"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  style={styles.modernInput}
                  secureTextEntry
                />
              </View>

              {/* Role Selection */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>User Role</Text>
                <View style={styles.roleContainer}>
                  <TouchableOpacity
                    style={[
                      styles.roleOptionButton,
                      newRole === "standard" && styles.roleOptionButtonSelected,
                    ]}
                    onPress={() => setNewRole("standard")}
                  >
                    <Text style={styles.roleOptionIcon}>👤</Text>
                    <Text
                      style={[
                        styles.roleOptionText,
                        newRole === "standard" && styles.roleOptionTextSelected,
                      ]}
                    >
                      Standard
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.roleOptionButton,
                      newRole === "admin" && styles.roleOptionButtonSelected,
                    ]}
                    onPress={() => setNewRole("admin")}
                  >
                    <Text style={styles.roleOptionIcon}>👑</Text>
                    <Text
                      style={[
                        styles.roleOptionText,
                        newRole === "admin" && styles.roleOptionTextSelected,
                      ]}
                    >
                      Admin
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Info Note */}
              <View style={styles.infoBox}>
                <Text style={styles.infoIcon}>ℹ️</Text>
                <Text style={styles.infoText}>
                  You'll need to confirm with your admin password
                </Text>
              </View>
            </View>

            {/* Modal Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleAddUserRequest}
              >
                <Text style={styles.confirmButtonText}>Add User</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ✅ PASSWORD CONFIRMATION MODAL */}
      <Modal
        visible={showPasswordModal}
        animationType="fade"
        transparent
        onRequestClose={handleCancelPasswordModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.passwordModalContent}>
            <View style={styles.securityIcon}>
              <Text style={styles.securityIconText}>🔒</Text>
            </View>
            
            <Text style={styles.modalTitle}>Security Confirmation</Text>
            <Text style={styles.confirmText}>
              For security reasons, please enter your admin password to confirm:
            </Text>
            
            {/* User Info Summary */}
            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Name:</Text>
                <Text style={styles.summaryValue}>{newName}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Email:</Text>
                <Text style={styles.summaryValue}>{newEmail}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Role:</Text>
                <View style={[
                  styles.summaryRoleBadge,
                  { backgroundColor: newRole === 'admin' ? '#DBEAFE' : '#DCFCE7' }
                ]}>
                  <Text style={[
                    styles.summaryRoleText,
                    { color: newRole === 'admin' ? '#0369A1' : '#16A34A' }
                  ]}>
                    {newRole === 'admin' ? '👑 Admin' : '👤 Standard'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Admin Password</Text>
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                value={adminPassword}
                onChangeText={setAdminPassword}
                style={styles.modernInput}
                secureTextEntry
                autoFocus
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelPasswordModal}
              >
                <Text style={styles.cancelButtonText}>Back</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmAddUser}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F9FAFB' 
  },
  
  header: { 
    paddingTop: 50, 
    paddingBottom: 20, 
    backgroundColor: '#fff', 
    alignItems: 'center', 
    borderBottomWidth: 1, 
    borderBottomColor: '#F3F4F6',
    elevation: 2,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 3
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: '#111827' 
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },

  statusCard: { 
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: 20, 
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 10
  },
  statusLabel: { 
    color: '#6B7280', 
    fontSize: 13, 
    fontWeight: '600', 
    marginBottom: 16,
    textAlign: 'center'
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    elevation: 1,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  clearIcon: {
    fontSize: 18,
    color: '#9CA3AF',
    fontWeight: '700',
  },

  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: '#111827', 
    marginBottom: 15 
  },

  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 20,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  userMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userIcon: {
    fontSize: 24,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
    marginBottom: 6,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  roleButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleButtonIcon: {
    fontSize: 18,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonIcon: {
    fontSize: 18,
  },

  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    marginTop: 10,
  },
  emptyIcon: { 
    fontSize: 48, 
    marginBottom: 15 
  },
  emptyStateText: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#6B7280', 
    marginBottom: 5 
  },
  emptyStateSubtext: { 
    fontSize: 13, 
    color: '#9CA3AF', 
    textAlign: 'center' 
  },

  addButton: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0EA5E9',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  addButtonText: {
    fontSize: 36,
    color: '#fff',
    fontWeight: '300',
    lineHeight: 36,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  passwordModalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    maxWidth: 450,
    alignSelf: 'center',
    width: '100%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 16,
    textAlign: 'center',
    color: '#111827',
  },
  modalForm: {
    gap: 16,
    marginBottom: 20,
  },
  inputWrapper: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
    marginLeft: 4,
  },
  modernInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 15,
    padding: 15,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    color: '#111827',
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  roleOptionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 15,
    backgroundColor: '#fff',
  },
  roleOptionButtonSelected: {
    backgroundColor: '#0EA5E9',
    borderColor: '#0EA5E9',
  },
  roleOptionIcon: {
    fontSize: 20,
  },
  roleOptionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
  roleOptionTextSelected: {
    color: '#fff',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  infoIcon: {
    fontSize: 18,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontWeight: '700',
    fontSize: 15,
    color: '#6B7280',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#0EA5E9',
    paddingVertical: 14,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 2,
  },
  confirmButtonText: {
    fontWeight: '800',
    fontSize: 15,
    color: '#fff',
  },

  // Password Confirmation Modal
  securityIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  securityIconText: {
    fontSize: 36,
  },
  confirmText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  summaryBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 15,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  summaryRoleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  summaryRoleText: {
    fontSize: 11,
    fontWeight: '800',
  },
});