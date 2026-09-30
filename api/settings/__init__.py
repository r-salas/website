#
#
#   Settings
#
#

import os
import warnings

try:
    # local settings always have preference
    from .local import *  # noqa
except (ImportError, ModuleNotFoundError):
    environ = os.environ.get("ENV", "development")

    if environ == "production":
        from .production import *  # noqa
    elif environ == "development":
        from .development import *  # noqa
    else:
        warnings.warn(f"Unexpected env {environ} found. Loading base settings ...")
        from .base import *  # noqa
