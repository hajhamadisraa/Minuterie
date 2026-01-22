const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialiser Firebase Admin
admin.initializeApp();

// Cloud Function pour créer un utilisateur
exports.createUser = functions.https.onCall(async (data, context) => {
  // Vérifier l'authentification
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Vous devez être connecté pour effectuer cette action'
    );
  }

  try {
    // Vérifier si l'appelant est admin
    const callerDoc = await admin.firestore()
      .collection('users')
      .doc(context.auth.uid)
      .get();

    if (!callerDoc.exists || callerDoc.data().role !== 'admin') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Seuls les administrateurs peuvent créer des utilisateurs'
      );
    }

    // Valider les données
    if (!data.email || !data.password) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Email et mot de passe requis'
      );
    }

    // Créer l'utilisateur dans Authentication
    const userRecord = await admin.auth().createUser({
      email: data.email,
      password: data.password,
      emailVerified: false
    });

    // Créer le document dans Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email: data.email,
      nom: data.nom || '',
      prenom: data.prenom || '',
      telephone: data.telephone || '',
      role: data.role || 'user',
      uid: userRecord.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: context.auth.uid
    });

    console.log('Utilisateur créé:', userRecord.uid);

    return {
      success: true,
      uid: userRecord.uid,
      message: 'Utilisateur créé avec succès'
    };

  } catch (error) {
    console.error('Erreur création utilisateur:', error);
    
    // Si l'erreur est déjà une HttpsError, la relancer
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    // Sinon, créer une nouvelle HttpsError
    throw new functions.https.HttpsError('internal', error.message);
  }
});