import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

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

  const apiBase =
    import.meta.env.VITE_API_BASE || import.meta.env.REACT_APP_API_BASE || "http://localhost:5000";

  // const user = JSON.parse(localStorage.getItem("user"));
  // fetch medicines on mount
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
      console.error(err);
    }
  }, [apiBase]);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  useEffect(() => {
    const order = ["Morning", "Afternoon", "Evening", "Night"];
    let sorted = [...medicines];

    if (sortFilter !== "All") {
      sorted = medicines.filter((m) => m.schedule === sortFilter);
    } else {
      sorted.sort(
        (a, b) => order.indexOf(a.schedule) - order.indexOf(b.schedule)
      );
    }

    setFilteredMeds(sorted);
  }, [sortFilter, medicines]);

  // const fetchMedicines = async () => {
  //   try {
  //     const res = await axios.get("http://localhost:5000/api/medicines");
  //     setMedicines(res.data);
  //   } catch (error) {
  //     console.error("Fetch error:", error);
  //   }
  // };



  const handleSortChange = (e) => {
    const selected = e.target.value;
    setSortFilter(selected);

    if (selected === "All") {
      setFilteredMeds(medicines);
    } else {
      setFilteredMeds(medicines.filter((m) => m.schedule === selected));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleScheduleChange = (value) => {
    setForm({ ...form, schedule: value }); // only one selected
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.dosage || !form.schedule || !form.time)
      return alert("Please fill all fields");

    try {
      if (editId) {
        await axios.put(`${apiBase}/api/medicines/${editId}`,
        form,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
        );
        setEditId(null);
      } else {
        await axios.post(`${apiBase}/api/medicines`,
        form,
        {
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
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this medicine?"))
      return;
    try {
      await axios.delete(`${apiBase}/api/medicines/${id}`,
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      fetchMedicines();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleEdit = (med) => {
    setForm({
      name: med.name,
      dosage: med.dosage,
      schedule: med.schedule,
      time: med.time,
      beforeFood: med.beforeFood,
    });
    setEditId(med._id);
  };

  return (
    <div className="layout-content-container flex flex-col w-full flex-1 overflow-y-auto p-4">

      {/* Header */}
      <div className="flex items-start md:items-center justify-between mb-4 gap-3">
        <h1 className="text-2xl font-bold">Medication</h1>
        <div className="text-sm text-gray-600">{editId ? "Edit Medicine" : "Add Medicine"}</div>
      </div>

      <form onSubmit={handleSubmit} className="section-card max-w-xl">
        <div className="grid grid-cols-1 gap-4">
          <label className="flex flex-col">
            <span className="text-sm pb-1">Medicine Name*</span>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Enter medicine name" className="rounded-lg h-12 bg-[#e7eff3] p-3" />
          </label>

          <label className="flex flex-col">
            <span className="text-sm pb-1">Dosage*</span>
            <input name="dosage" value={form.dosage} onChange={handleChange} placeholder="Enter dosage" className="rounded-lg h-12 bg-[#e7eff3] p-3" />
          </label>

          <div>
            <div className="text-sm pb-1">Schedule*</div>
            <div className="flex flex-wrap gap-3">
              {["Morning", "Afternoon", "Evening", "Night"].map((opt) => (
                <label key={opt} className="flex items-center gap-2">
                  <input type="checkbox" checked={form.schedule === opt} onChange={() => handleScheduleChange(opt)} />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          <label className="flex flex-col">
            <span className="text-sm pb-1">Time*</span>
            <input type="time" name="time" value={form.time} onChange={handleChange} className="rounded-lg h-12 bg-[#e7eff3] p-3" />
          </label>

          <div>
            <div className="text-sm pb-1">Take Before Food?</div>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="beforeFood" checked={form.beforeFood} onChange={handleChange} />
              {form.beforeFood ? "Yes (Before Food)" : "No (After Food)"}
            </label>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary">
              {editId ? "Update Medicine" : "Add Medicine"}
            </button>
          </div>
        </div>
      </form>

      <div className="mt-6 flex items-center justify-between section-card">
        <h2 className="section-title">Scheduled Medications</h2>
        <div className="flex items-center gap-2">
          <label className="font-medium text-sm">Sort by Schedule:</label>
          <select value={sortFilter} onChange={handleSortChange} className="border border-gray-300 rounded-md px-2 py-1 text-sm bg-white">
            <option value="All">All</option>
            <option value="Morning">Morning</option>
            <option value="Afternoon">Afternoon</option>
            <option value="Evening">Evening</option>
            <option value="Night">Night</option>
          </select>
        </div>
      </div>

      <div className="mt-4">
        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {filteredMeds.length === 0 && <div className="text-sm text-gray-500">No medicines found for {sortFilter === "All" ? "any schedule" : sortFilter}.</div>}
          {filteredMeds.map((med) => (
            <div key={med._id} className="card">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <div className="font-medium break-words">{med.name}</div>
                  <div className="text-sm text-gray-600 mt-1">{med.dosage} • {med.beforeFood ? "Before" : "After"} food</div>
                  <div className="text-sm text-gray-500 mt-1">{med.schedule} • {med.time || "—"}</div>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => handleEdit(med)} className="btn btn-sm btn-outline flex-1">Edit</button>
                <button onClick={() => handleDelete(med._id)} className="btn btn-sm btn-danger flex-1">Delete</button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto mt-2 section-card">
          <table className="min-w-[720px] w-full rounded-lg">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left">Medication</th>
                <th className="px-4 py-3 text-left">Dosage</th>
                <th className="px-4 py-3 text-left">Schedule</th>
                <th className="px-4 py-3 text-left">Time</th>
                <th className="px-4 py-3 text-left">Before Food</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMeds.map((med) => (
                <tr key={med._id} className="border-t">
                  <td className="px-4 py-2 break-words whitespace-normal">{med.name}</td>
                  <td className="px-4 py-2 break-words whitespace-normal">{med.dosage}</td>
                  <td className="px-4 py-2">{med.schedule}</td>
                  <td className="px-4 py-2">{med.time}</td>
                  <td className="px-4 py-2">{med.beforeFood ? "Before Food" : "After Food"}</td>
                  <td className="px-4 py-2 flex gap-2 table-actions">
                    <button onClick={() => handleEdit(med)} className="btn btn-sm btn-outline">Edit</button>
                    <button onClick={() => handleDelete(med._id)} className="btn btn-sm btn-danger">Delete</button>
                  </td>
                </tr>
              ))}
              {filteredMeds.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500">No medicines found for {sortFilter === "All" ? "any schedule" : sortFilter}.</td>
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
