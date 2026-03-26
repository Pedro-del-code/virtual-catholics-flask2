from flask import Flask, render_template, request, session, redirect, url_for, jsonify
from dotenv import load_dotenv
import os
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "dev-secret-key")

cred = credentials.Certificate(os.getenv("FIREBASE_SERVICE_ACCOUNT", "serviceAccount.json"))
firebase_admin.initialize_app(cred)

# ── ROTAS PRINCIPAIS ──

@app.route("/")
def index():
    if session.get("user"):
        return redirect(url_for("dashboard"))
    return render_template("intro.html")

@app.route("/login")
def login():
    if session.get("user"):
        return redirect(url_for("dashboard"))
    return render_template("auth.html", tab="login")

@app.route("/register")
def register():
    if session.get("user"):
        return redirect(url_for("dashboard"))
    return render_template("auth.html", tab="register")

@app.route("/reset")
def reset():
    return render_template("reset.html")

@app.route("/dashboard")
def dashboard():
    if not session.get("user"):
        return redirect(url_for("index"))
    return render_template("dashboard.html", user=session["user"])

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("index"))

# ── AUTH API ──

@app.route("/verify-token", methods=["POST"])
def verify_token():
    try:
        id_token = request.get_json().get("idToken")
        decoded = firebase_auth.verify_id_token(id_token)
        session["user"] = {
            "uid": decoded["uid"],
            "email": decoded.get("email"),
            "name": decoded.get("name", decoded.get("email", "").split("@")[0]),
            "picture": decoded.get("picture"),
        }
        return jsonify({"success": True, "redirect": url_for("dashboard")})
    except Exception as e:
        return jsonify({"error": str(e)}), 401

if __name__ == "__main__":
    app.run(debug=True)
