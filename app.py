from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
<<<<<<< Updated upstream
import mercadopago
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://usuario:password@localhost/ventas_db'
db = SQLAlchemy(app)
=======
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import mercadopago

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://Gestion-Ventas-DB_owner:npg_TfNJS2jMLH3F@ep-withered-base-a8baho3b-pooler.eastus2.azure.neon.tech/Gestion-Ventas-DB?sslmode=require'
app.config['JWT_SECRET_KEY'] = 'supersecretkey'  # Clave secreta para JWT

db = SQLAlchemy(app)
jwt = JWTManager(app)
>>>>>>> Stashed changes

# Modelo de Usuario
class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), nullable=False)
    apellido = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    autorizado = db.Column(db.Boolean, default=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

# Registro de usuario
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    if Usuario.query.filter_by(email=data['email']).first():
        return jsonify({"error": "El email ya está registrado"}), 400
    
    usuario = Usuario(
        nombre=data['nombre'],
        apellido=data['apellido'],
        email=data['email']
    )
    usuario.set_password(data['password'])
    db.session.add(usuario)
    db.session.commit()
    return jsonify({"message": "Usuario registrado. Proceda al pago."})

<<<<<<< Updated upstream
=======
# Login de usuario
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    usuario = Usuario.query.filter_by(email=data['email']).first()
    
    if not usuario or not usuario.check_password(data['password']):
        return jsonify({"error": "Credenciales incorrectas"}), 401
    
    if not usuario.autorizado:
        return jsonify({"error": "Usuario no autorizado. Realice el pago."}), 403
    
    access_token = create_access_token(identity=usuario.id)
    return jsonify({"token": access_token})

# Obtener ID de usuario por email
@app.route('/get_user_id', methods=['GET'])
def get_user_id():
    email = request.args.get('email')
    usuario = Usuario.query.filter_by(email=email).first()
    
    if usuario:
        return jsonify({"user_id": usuario.id})
    
    return jsonify({"error": "Usuario no encontrado"}), 404


# Ruta protegida de prueba
@app.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    user_id = get_jwt_identity()
    usuario = Usuario.query.get(user_id)
    return jsonify({"message": f"Bienvenido, {usuario.nombre}"})

>>>>>>> Stashed changes
# Integración con Mercado Pago para la membresía
sdk = mercadopago.SDK("TU_ACCESS_TOKEN")
@app.route('/pagar_membresia/<int:user_id>', methods=['POST'])
def pagar_membresia(user_id):
<<<<<<< Updated upstream
    usuario = Usuario.query.get(user_id)
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404
    
    preference_data = {
        "items": [{
            "title": "Membresía Servicio Ventas",
            "quantity": 1,
            "unit_price": 10.00,
            "currency_id": "ARS"
        }],
        "back_urls": {
            "success": "http://localhost:5000/pago_exitoso/{}/".format(user_id)
        },
        "auto_return": "approved"
    }
    preference = sdk.preference().create(preference_data)
    return jsonify(preference["response"]["init_point"])

@app.route('/pago_exitoso/<int:user_id>/', methods=['GET'])
def pago_exitoso(user_id):
    usuario = Usuario.query.get(user_id)
    if usuario:
        usuario.autorizado = True
        db.session.commit()
        return jsonify({"message": "Pago recibido, usuario autorizado."})
    return jsonify({"error": "Usuario no encontrado"}), 404
=======
    with app.app_context():
        usuario = Usuario.query.get(user_id)
        if not usuario:
            return jsonify({"error": "Usuario no encontrado"}), 404
        
        preference_data = {
            "items": [{
                "title": "Membresía Servicio Ventas",
                "quantity": 1,
                "unit_price": 10000,
                "currency_id": "ARS"
            }],
            "back_urls": {
                "success": f"http://localhost:5000/pago_exitoso/{user_id}/"
            },
            "auto_return": "approved"
        }
        preference = sdk.preference().create(preference_data)
        return jsonify(preference["response"]["init_point"])

@app.route('/pago_exitoso/<int:user_id>/', methods=['GET'])
def pago_exitoso(user_id):
    with app.app_context():
        usuario = Usuario.query.get(user_id)
        if usuario:
            usuario.autorizado = True
            db.session.commit()
            return jsonify({"message": "Pago recibido, usuario autorizado."})
        return jsonify({"error": "Usuario no encontrado"}), 404
>>>>>>> Stashed changes

if __name__ == '__main__':
    db.create_all()
    app.run(debug=True)
