from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import mercadopago
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://usuario:password@localhost/ventas_db'
db = SQLAlchemy(app)

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

# Integración con Mercado Pago para la membresía
sdk = mercadopago.SDK("TU_ACCESS_TOKEN")
@app.route('/pagar_membresia/<int:user_id>', methods=['POST'])
def pagar_membresia(user_id):
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

if __name__ == '__main__':
    db.create_all()
    app.run(debug=True)
