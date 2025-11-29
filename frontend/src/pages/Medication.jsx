import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

const apiBase =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.REACT_APP_API_BASE ||
  "http://localhost:5000";

const Medication = () => {
  const [medicines, setMedicines] = useState([]);
  const [filteredMeds, setFilteredMeds] = useState([]);
  const [sortFilter, setSortFilter] = useState("All");

  const [form, setForm] = useState({
    name: "",
    dosage: "",
    schedule: "",
    time: "",
    beforeFood: false,
  });

  const [editId, setEditId] = useState(null);

  // Fetch medicines (merged + stable version)
  const fetchMedicines = useCallback(async () => {
    try {
      const res = await axios.get(`${apiBase}/api/medicines`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setMedicines(res.data);
    } catch (err) {
      console.error("Fetch medicines failed:", err);
    }
  }, []);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  // Sorting logic
  useEffect(() => {
    const order = ["Morning", "Afternoon", "Evening", "Night"];
    let sorted = [...medicines];

    if (sortFilter !== "All") {
      sorted = medicines.filter((m) => m.schedule === sortFilter);
    } else {
      sorted.sort((a, b) => order.indexOf(a.schedule) - order.indexOf(b.schedule));
    }
    setFilteredMeds(sorted);
  }, [medicines, sortFilter]);

  // Handlers
  const handleSortChange = (e) => setSortFilter(e.target.value);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleScheduleChange = (value) =>
    setForm({ ...form, schedule: value });

  const handleEdit = (med) => {
    setEditId(med._id);
    setForm({
      name: med.name,
      dosage: med.dosage,
      schedule: med.schedule,
      time: med.time,
      beforeFood: med.beforeFood,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this medicine?")) return;

    try {
      await axios.delete(`${apiBase}/api/medicines/${id}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      fetchMedicines();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.dosage || !form.schedule || !form.time) {
      return alert("Please fill all required fields.");
    }

    try {
      if (editId) {
        await axios.put(`${apiBase}/api/medicines/${editId}`, form, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setEditId(null);
      } else {
        await axios.post(`${apiBase}/api/medicines`, form, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      }

      setForm({
        name: "",
        dosage: "",
        schedule: "",
        time: "",
        beforeFood: false,
      });

      fetchMedicines();
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  return (
    <div
      className="
      flex flex-col max-w-[960px] w-full flex-1 overflow-y-auto
      p-6
      bg-[var(--background-light)]
      text-[var(--text-primary)]
      dark:bg-[#000000ff]
      dark:text-slate-200"
    >
      <h1 className="text-3xl font-bold mb-4 dark:text-white">Medication</h1>

      {/* Form Card */}
      <div
        className="
        p-4 rounded-xl mb-6
        bg-white dark:bg-[#1e293b]
        border border-gray-200 dark:border-gray-600
      "
      >
        <h2 className="text-xl font-bold mb-3 dark:text-white">
          {editId ? "Edit Medicine" : "Add Medicine"}
        </h2>

        <form onSubmit={handleSubmit}>
          <label className="flex flex-col mb-4">
            <span className="font-medium mb-1 dark:text-slate-200">
              Medicine Name*
            </span>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="
                rounded-lg h-12 p-3
                bg-[#e7eff3] dark:bg-[#334155] dark:text-white
              "
              placeholder="Enter medicine name"
            />
          </label>

          <label className="flex flex-col mb-4">
            <span className="font-medium mb-1 dark:text-slate-200">Dosage*</span>
            <input
              name="dosage"
              value={form.dosage}
              onChange={handleChange}
              className="
                rounded-lg h-12 p-3
                bg-[#e7eff3] dark:bg-[#334155] dark:text-white
              "
              placeholder="Enter dosage"
            />
          </label>

          {/* Schedule */}
          <div className="mb-4">
            <span className="font-medium mb-2 block dark:text-slate-200">
              Schedule*
            </span>
            <div className="flex gap-4 flex-wrap">
              {["Morning", "Afternoon", "Evening", "Night"].map((opt) => (
                <label key={opt} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.schedule === opt}
                    onChange={() => handleScheduleChange(opt)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          {/* Time */}
          <label className="flex flex-col mb-4">
            <span className="font-medium mb-1 dark:text-slate-200">Time*</span>
            <input
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              className="
                rounded-lg h-12 p-3
                bg-[#e7eff3] dark:bg-[#334155] dark:text-white
              "
            />
          </label>

          {/* Before Food */}
          <div className="mb-4">
            <span className="font-medium mb-2 block dark:text-slate-200">
              Take Before Food?
            </span>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="beforeFood"
                checked={form.beforeFood}
                onChange={handleChange}
              />
              {form.beforeFood ? "Yes (Before Food)" : "No (After Food)"}
            </label>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              className="
                bg-blue-600 text-white px-4 py-2 rounded-lg font-bold
                hover:bg-blue-700
                dark:bg-blue-700 dark:hover:bg-blue-800
              "
            >
              {editId ? "Update Medicine" : "Add Medicine"}
            </button>
          </div>
        </form>
      </div>

      {/* Table Header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold dark:text-white">
          Scheduled Medications
        </h2>

        <div className="flex items-center gap-2">
          <label className="font-medium text-sm dark:text-slate-300">
            Sort by schedule:
          </label>

          <select
            value={sortFilter}
            onChange={handleSortChange}
            className="
              border border-gray-300 rounded-md px-2 py-1 text-sm
              bg-white dark:bg-[#334155]
              dark:text-white dark:border-gray-600
            "
          >
            <option value="All">All</option>
            <option value="Morning">Morning</option>
            <option value="Afternoon">Afternoon</option>
            <option value="Evening">Evening</option>
            <option value="Night">Night</option>
          </select>
        </div>
      </div>

      {/* MED LIST */}
      <div>
        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {filteredMeds.length === 0 && (
            <div className="text-sm text-gray-500 dark:text-slate-400">
              No medicines found.
            </div>
          )}

          {filteredMeds.map((med) => (
            <div
              key={med._id}
              className="p-4 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-600 rounded-lg shadow"
            >
              <div className="font-semibold dark:text-white">{med.name}</div>
              <div className="text-sm text-gray-600 dark:text-slate-300">
                {med.dosage} • {med.beforeFood ? "Before" : "After"} food
              </div>
              <div className="text-sm text-gray-500 dark:text-slate-400">
                {med.schedule} • {med.time}
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleEdit(med)}
                  className="flex-1 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(med._id)}
                  className="flex-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-auto rounded-xl border border-gray-200 dark:border-gray-600 mt-4">
          <table className="w-full">
            <thead className="bg-slate-100 dark:bg-[#334155] dark:text-white">
              <tr>
                <th className="px-4 py-3 text-left">Medication</th>
                <th className="px-4 py-3 text-left">Dosage</th>
                <th className="px-4 py-3 text-left">Schedule</th>
                <th className="px-4 py-3 text-left">Time</th>
                <th className="px-4 py-3 text-left">Before Food</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody className="dark:text-white">
              {filteredMeds.map((med) => (
                <tr key={med._id} className="border-t dark:border-gray-700">
                  <td className="px-4 py-2">{med.name}</td>
                  <td className="px-4 py-2">{med.dosage}</td>
                  <td className="px-4 py-2">{med.schedule}</td>
                  <td className="px-4 py-2">{med.time}</td>
                  <td className="px-4 py-2">
                    {med.beforeFood ? "Before Food" : "After Food"}
                  </td>

                  <td className="px-4 py-2 flex gap-2">
                    <button
                      onClick={() => handleEdit(med)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(med._id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {filteredMeds.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-4 text-gray-500 dark:text-slate-400"
                  >
                    No medicines found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Medication;
