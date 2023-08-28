import os

from flask import Flask, render_template
from werkzeug.exceptions import HTTPException

from app.logger import log


def create_app(environment="development"):
    from config import config
    from app.views import main_blueprint, photo_blueprint

    # Instantiate app.
    app = Flask(__name__)

    # Set app config.
    env = os.environ.get("APP_ENV", environment)
    configuration = config(env)
    app.config.from_object(configuration)
    configuration.configure(app)
    log(log.INFO, "Configuration: [%s]", configuration.ENV)

    # Register blueprints.
    app.register_blueprint(main_blueprint)
    app.register_blueprint(photo_blueprint)
    # Set up flask login.

    # Error handlers.
    @app.errorhandler(HTTPException)
    def handle_http_error(exc):
        return render_template("error.html", error=exc), exc.code

    return app
