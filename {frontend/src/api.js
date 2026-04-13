const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const res = await authAPI.login(form);

    login(res.data.user, res.data.token);

    toast.success(`Welcome back, ${res.data.user.name}!`);
    navigate('/dashboard');
  } catch (err) {
    toast.error(err.response?.data?.message || 'Login failed');
  } finally {
    setLoading(false);
  }
};