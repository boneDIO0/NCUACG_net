import random
import string

def alnum_case_sensitive(length=5):
    chars = string.ascii_letters + string.digits  # A-Z, a-z, 0-9
    text = ''.join(random.choice(chars) for _ in range(length))
    return text, text